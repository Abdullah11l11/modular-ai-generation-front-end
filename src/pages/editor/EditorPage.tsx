import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useProject } from '@/features/projects/hooks/useProject';
import { useProjectFiles } from '@/features/files/hooks/useProjectFiles';
import { useCreateProjectFile } from '@/features/files/hooks/useCreateProjectFile';
import { useDeleteProjectFile } from '@/features/files/hooks/useDeleteProjectFile';
import { useReorderProjectFiles } from '@/features/files/hooks/useReorderProjectFiles';
import { EditorProvider } from '@/features/editor/components/EditorProvider';
import { useEditorContext } from '@/features/editor/hooks/useEditorStore';
import { getEditorMode } from '@/features/editor/utils/editorMode';
import { groupSlides } from '@/features/editor/utils/groupSlides';
import { SlideLibraryPanel } from '@/features/editor/components/SlideLibrary/SlideLibraryPanel';
import { PreviewCanvas } from '@/features/editor/components/Preview/PreviewCanvas';
import { PropertiesPanel } from '@/features/editor/components/PropertiesPanel/PropertiesPanel';
import { SinglePageEditorShell } from '@/features/editor/components/SinglePageEditor/SinglePageEditorShell';
import { EditorToolbar } from '@/features/editor/components/EditorToolbar';
import { EditorStatusBar } from '@/features/editor/components/EditorStatusBar';
import { FullScreenPreview } from '@/features/editor/components/FullScreen/FullScreenPreview';
import { ExportDialog } from '@/features/editor/components/Export/ExportDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProjectSettingsPanel } from '@/features/projects/components/ProjectSettingsPanel';
import { ErrorFallback } from '@/components/error-fallback';
import { FullPageLoader } from '@/components/full-page-loader';
import type { Project, ProjectFileKind, Id } from '@/types/api';

function getNextStem(slides: { stem: string }[]): string {
  const nums = slides
    .map((s) => {
      const m = s.stem.match(/slide-(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !Number.isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `slide-${String(next).padStart(2, '0')}`;
}

type EditorShellProps = {
  project: Project;
};

function EditorShell({ project }: EditorShellProps) {
  const { state, dispatch } = useEditorContext();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: filesResponse, isLoading: filesLoading } = useProjectFiles(state.projectId);
  const files = filesResponse?.data ?? [];
  const slides = groupSlides(files);
  const selectedIdx = state.selectedSlideId
    ? slides.findIndex((s) => s.files.slide?.id === state.selectedSlideId)
    : -1;
  const activeLayers = (Object.entries(state.layerVisibility) as [ProjectFileKind, boolean][])
    .filter(([, v]) => v)
    .map(([k]) => k);
  const isPerSlide = state.editorMode === 'per-slide';

  const selectedGroup = isPerSlide
    ? (slides.find((s) => s.files.slide?.id === state.selectedSlideId) ?? null)
    : null;

  const selectedSlideHtmlFile = selectedGroup?.files.slide ?? null;

  function findFile(layer: string, name: string) {
    return files.find((f) => f.layer === layer && f.name === name);
  }

  const styleCssFile = findFile('style', 'style.css') ?? null;
  const layoutCssFile = findFile('layout', 'layout.css') ?? null;

  const createMutation = useCreateProjectFile();
  const deleteMutation = useDeleteProjectFile();
  const reorderMutation = useReorderProjectFiles();

  const invalidateFiles = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['projects', state.projectId, 'files'] });
  }, [queryClient, state.projectId]);

  const handleAddSlide = useCallback(
    (sourceStem: string | null = null) => {
      const stem = getNextStem(slides);
      const sourceGroup = sourceStem ? (slides.find((s) => s.stem === sourceStem) ?? null) : null;

      type FileSpec = { layer: ProjectFileKind; extension: string; content: string };

      // Clone every layer the source slide has. UVCP projects only carry
      // a `slide` file per slide, so cloning just produces one file. MGF
      // projects may carry slide/style/content companions.
      const clonedFiles: FileSpec[] = sourceGroup
        ? (['slide', 'style', 'content'] as const).flatMap((layer) => {
            const f = sourceGroup.files[layer];
            if (!f) return [];
            return [{ layer, extension: f.extension, content: f.content ?? '' }];
          })
        : [];

      // No source → fall back to a blank triple (legacy behaviour for
      // empty projects that have no slides to clone from).
      const filesToCreate: FileSpec[] =
        clonedFiles.length > 0
          ? clonedFiles
          : [
              { layer: 'slide', extension: 'html', content: '' },
              { layer: 'style', extension: 'css', content: '' },
              {
                layer: 'content',
                extension: 'json',
                content: JSON.stringify({ title: stem }, null, 2),
              },
            ];

      Promise.all(
        filesToCreate.map(({ layer, extension, content }) =>
          createMutation.mutateAsync({
            projectId: state.projectId,
            payload: {
              layer,
              name: `${stem}.${extension}`,
              extension,
              content,
            },
          }),
        ),
      ).then(() => invalidateFiles());
    },
    [slides, state.projectId, createMutation, invalidateFiles],
  );

  const handleDeleteSlides = useCallback(
    (stems: string[]) => {
      const fileIds: Id[] = [];
      for (const stem of stems) {
        const group = slides.find((s) => s.stem === stem);
        if (group) {
          const ids = [
            group.files.slide?.id,
            group.files.style?.id,
            group.files.content?.id,
          ].filter(Boolean) as Id[];
          fileIds.push(...ids);
        }
      }
      Promise.all(
        fileIds.map((fileId) => deleteMutation.mutateAsync({ projectId: state.projectId, fileId })),
      ).then(() => invalidateFiles());
    },
    [slides, state.projectId, deleteMutation, invalidateFiles],
  );

  const handleReorderFiles = useCallback(
    (projectId: string, order: string[]) => {
      reorderMutation.mutate({ projectId, order }, { onSuccess: () => invalidateFiles() });
    },
    [reorderMutation, invalidateFiles],
  );

  return (
    <div className="flex flex-1 flex-col">
      <EditorToolbar
        projectName={project.name}
        onPreview={() => setIsPreviewOpen(true)}
        onExport={() => setIsExportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {isPerSlide ? (
        <div className="flex flex-1 overflow-hidden">
          <aside className="flex w-64 shrink-0 flex-col border-r border-(--bor2) bg-(--sur) p-3">
            <SlideLibraryPanel
              files={files}
              selectedSlideId={state.selectedSlideId}
              layerVisibility={state.layerVisibility}
              onSelectSlide={(fileId) =>
                dispatch({ type: 'SET_SELECTED_SLIDE_ID', payload: fileId })
              }
              onToggleLayer={(kind) => dispatch({ type: 'TOGGLE_LAYER', payload: kind })}
              onAddSlide={handleAddSlide}
              onDeleteSlides={handleDeleteSlides}
              onReorderFiles={handleReorderFiles}
              projectId={state.projectId}
            />
          </aside>

          <main className="flex flex-1 overflow-hidden">
            <PreviewCanvas />
          </main>

          <aside className="flex w-72 shrink-0 flex-col border-l border-(--bor2) bg-(--sur) p-3">
            <PropertiesPanel
              projectId={state.projectId}
              selectedSlideHtmlFile={selectedSlideHtmlFile}
              styleCssFile={styleCssFile}
              layoutCssFile={layoutCssFile}
              filesLoading={filesLoading}
            />
          </aside>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <SinglePageEditorShell project={project} files={files} filesLoading={filesLoading} />
        </div>
      )}

      <EditorStatusBar
        slideIndex={isPerSlide ? (selectedIdx >= 0 ? selectedIdx + 1 : 0) : 0}
        totalSlides={isPerSlide ? slides.length : 0}
        selectedElement={state.selectedElement}
        activeLayers={isPerSlide ? activeLayers : []}
      />

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Project Settings</DialogTitle>
          </DialogHeader>
          <ProjectSettingsPanel project={project} onSaved={() => setIsSettingsOpen(false)} />
        </DialogContent>
      </Dialog>

      {isPreviewOpen && (
        <FullScreenPreview files={files} onClose={() => setIsPreviewOpen(false)} />
      )}

      <ExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        files={files}
        projectName={project.name}
      />
    </div>
  );
}

export default function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return <ErrorFallback error={new Error('Project ID is required')} />;
  }

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
    error: projectErr,
    refetch: refetchProject,
  } = useProject(projectId);

  if (projectError) {
    return <ErrorFallback error={projectErr as Error} reset={refetchProject} />;
  }

  if (projectLoading || !project) {
    return <FullPageLoader label="Loading editor..." />;
  }

  const editorMode = getEditorMode(project.type?.name);

  return (
    <EditorProvider
      projectId={projectId}
      projectType={project.type?.name ?? ''}
      editorMode={editorMode}
      direction={project.direction}
    >
      <EditorShell project={project} />
    </EditorProvider>
  );
}
