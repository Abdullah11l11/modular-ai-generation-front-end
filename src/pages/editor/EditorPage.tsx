import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useProject } from '@/features/projects/hooks/useProject';
import { useProjectFiles } from '@/features/files/hooks/useProjectFiles';
import { useCreateProjectFile } from '@/features/files/hooks/useCreateProjectFile';
import { useDeleteProjectFile } from '@/features/files/hooks/useDeleteProjectFile';
import { useReorderProjectFiles } from '@/features/files/hooks/useReorderProjectFiles';
import { useUpdateProjectFile } from '@/features/files/hooks/useUpdateProjectFile';
import { EditorProvider } from '@/features/editor/components/EditorProvider';
import { useEditorContext } from '@/features/editor/hooks/useEditorStore';
import { getEditorMode } from '@/features/editor/utils/editorMode';
import { groupSlides, extractSlideTitle, titleToStemFragment } from '@/features/editor/utils/groupSlides';
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
import type { Project, FileLayer, Id, ProjectFile } from '@/types/api';

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

/** Plan entry — one resolved file mutation produced by Apply. */
type Plan = {
  fileId?: string;
  layer: FileLayer;
  name: string;
  extension: string;
  content: string;
};

/** Best-guess extension for a layer + name when the caller didn't
 *  supply one. Falls back to the layer's canonical extension. */
function inferExtension(layer: FileLayer, name: string): string {
  const fromName = name.match(/\.([^.]+)$/);
  if (fromName) return fromName[1];
  switch (layer) {
    case 'slide':
      return 'html';
    case 'style':
    case 'layout':
      return 'css';
    case 'content':
      return 'json';
    default:
      return 'txt';
  }
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

  // Auto-select the first slide on mount so the canvas isn't empty.
  // Without this the user lands on "Select a slide to preview" with
  // nothing visible — particularly confusing for website projects
  // where users expect to see *something* immediately. Subsequent
  // renders do not re-fire the dispatch because `selectedSlideId` is
  // already non-null.
  useEffect(() => {
    if (state.selectedSlideId) return;
    const first = slides[0]?.files.slide?.id;
    if (first) dispatch({ type: 'SET_SELECTED_SLIDE_ID', payload: first });
  }, [slides, state.selectedSlideId, dispatch]);

  const selectedIdx = state.selectedSlideId
    ? slides.findIndex((s) => s.files.slide?.id === state.selectedSlideId)
    : -1;
  const activeLayers = (Object.entries(state.layerVisibility) as [FileLayer, boolean][])
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
  const updateMutation = useUpdateProjectFile();

  const invalidateFiles = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['projects', state.projectId, 'files'] });
  }, [queryClient, state.projectId]);

  // Commit the current AI proposal to the backend.
  //
  // Each `ProposalFile` is resolved against the live project file
  // list by `(layer, name)`. When `name` is omitted (the common
  // case for a single-slide rewrite) we fall back to the currently
  // selected slide's file in per-slide mode. Found files are PUT
  // (via updateMutation), missing ones are POSTed (via
  // createMutation). All operations run in parallel via
  // Promise.all so a multi-file apply completes in one round-trip.
  //
  // On success we toast the count and clear the proposal state;
  // on failure we keep the proposal visible so the user can retry.
  const handleApplyProposal = useCallback(async () => {
    const proposal = state.proposal;
    if (!proposal) return;

    const plans: Plan[] = [];
    for (const f of proposal.files) {
      // Resolve target name — fall back to the selected slide.
      let targetName = f.name;
      if (!targetName) {
        if (!selectedSlideHtmlFile) continue;
        targetName = selectedSlideHtmlFile.name;
      }
      // Look up the file in the live cache. If found, PUT; else POST.
      const existing = files.find(
        (x) => x.layer === f.layer && x.name === targetName,
      );
      const extension =
        f.extension ?? existing?.extension ?? inferExtension(f.layer, targetName);
      if (existing) {
        plans.push({
          fileId: existing.id,
          layer: f.layer,
          name: targetName,
          extension,
          content: f.content,
        });
      } else {
        plans.push({
          layer: f.layer,
          name: targetName,
          extension,
          content: f.content,
        });
      }
    }

    if (plans.length === 0) {
      // Nothing to do — still clear so the banner goes away.
      dispatch({ type: 'APPLY_PROPOSAL' });
      toast.info('Nothing to apply — select a slide first.');
      return;
    }

    // Optimistic cache update so the preview flips immediately.
    queryClient.setQueryData(
      ['projects', state.projectId, 'files'],
      (old: { data: ProjectFile[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((f) => {
            const update = plans.find((p) => p.fileId === f.id);
            return update ? { ...f, content: update.content } : f;
          }),
        };
      },
    );

    try {
      await Promise.all(
        plans.map((p) =>
          p.fileId
            ? updateMutation.mutateAsync({
                projectId: state.projectId,
                fileId: p.fileId,
                payload: { content: p.content },
              })
            : createMutation.mutateAsync({
                projectId: state.projectId,
                payload: {
                  layer: p.layer,
                  name: p.name,
                  extension: p.extension,
                  content: p.content,
                },
              }),
        ),
      );
      await invalidateFiles();
      dispatch({ type: 'APPLY_PROPOSAL' });
      toast.success(
        plans.length === 1 ? 'Applied 1 change' : `Applied ${plans.length} changes`,
      );
    } catch (err) {
      // Roll back the optimistic update on failure so the editor
      // doesn't show stale applied state.
      await invalidateFiles();
      toast.error(
        `Apply failed: ${err instanceof Error ? err.message : 'unknown error'}`,
      );
    }
  }, [
    state.proposal,
    state.projectId,
    selectedSlideHtmlFile,
    files,
    queryClient,
    updateMutation,
    createMutation,
    invalidateFiles,
    dispatch,
  ]);

  // Populate the editor's preview-with-apply proposal state from
  // ChatView's Preview button. The actual file mutation only happens
  // when the user clicks Apply (handled by `handleApplyProposal`).
  const handlePreviewProposal = useCallback(
    (html: string, messageId: number, label: string) => {
      dispatch({
        type: 'SET_PROPOSAL',
        payload: {
          messageId,
          label,
          previewHtml: html,
          files: [{ layer: 'slide', content: html }],
        },
      });
    },
    [dispatch],
  );

  // Bypass preview and commit the AI's extracted slide HTML directly
  // to the selected slide's file. Mirrors the old "Insert into
  // editor" behaviour — kept for power users who already know what
  // they want.
  const handleInsertProposal = useCallback(
    (html: string) => {
      if (!selectedSlideHtmlFile) return;
      queryClient.setQueryData(
        ['projects', state.projectId, 'files'],
        (old: { data: ProjectFile[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((f) =>
              f.id === selectedSlideHtmlFile.id ? { ...f, content: html } : f,
            ),
          };
        },
      );
      updateMutation.mutate(
        {
          projectId: state.projectId,
          fileId: selectedSlideHtmlFile.id,
          payload: { content: html },
        },
        {
          onSettled: () => invalidateFiles(),
          onSuccess: () => toast.success('Applied 1 change'),
        },
      );
    },
    [
      state.projectId,
      selectedSlideHtmlFile,
      queryClient,
      updateMutation,
      invalidateFiles,
    ],
  );

  const handleAddSlide = useCallback(
    (sourceStem: string | null = null) => {
      const sourceGroup = sourceStem ? (slides.find((s) => s.stem === sourceStem) ?? null) : null;
      const baseStem = getNextStem(slides);
      // If the source has a data-field title, embed a slugified
      // fragment in the new stem so the file ends up named
      // e.g. `slide-12-pricing` rather than just `slide-12`.
      const titleFragment = sourceGroup
        ? titleToStemFragment(
            extractSlideTitle(sourceGroup.files.slide?.content, sourceGroup.stem),
          )
        : '';
      const stem = titleFragment ? `${baseStem}-${titleFragment}` : baseStem;

      type FileSpec = { layer: FileLayer; extension: string; content: string };

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
              direction={project.direction}
            />
          </aside>

          <main className="flex flex-1 overflow-hidden">
            <PreviewCanvas onApplyProposal={handleApplyProposal} />
          </main>

          <aside className="flex w-72 shrink-0 flex-col border-l border-(--bor2) bg-(--sur) p-3">
            <PropertiesPanel
              projectId={state.projectId}
              selectedSlideHtmlFile={selectedSlideHtmlFile}
              styleCssFile={styleCssFile}
              layoutCssFile={layoutCssFile}
              filesLoading={filesLoading}
              onPreviewProposal={handlePreviewProposal}
              onInsertProposal={handleInsertProposal}
            />
          </aside>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <SinglePageEditorShell
            project={project}
            files={files}
            filesLoading={filesLoading}
            onPreviewProposal={handlePreviewProposal}
            onInsertProposal={handleInsertProposal}
          />
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
