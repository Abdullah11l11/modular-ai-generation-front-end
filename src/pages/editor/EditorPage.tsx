import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '@/features/projects/hooks/useProject';
import { useProjectFiles } from '@/features/files/hooks/useProjectFiles';
import { ProjectSettingsPanel } from '@/features/projects/components/ProjectSettingsPanel';
import { EditorProvider } from '@/features/editor/components/EditorProvider';
import { useEditorContext } from '@/features/editor/hooks/useEditorStore';
import { EditorToolbar } from '@/features/editor/components/EditorToolbar';
import { EditorStatusBar } from '@/features/editor/components/EditorStatusBar';
import { SlideLibraryPanel } from '@/features/editor/components/SlideLibrary/SlideLibraryPanel';
import { PreviewCanvas } from '@/features/editor/components/Preview/PreviewCanvas';
import { PropertiesPanel } from '@/features/editor/components/PropertiesPanel/PropertiesPanel';
import { GenerationModal } from '@/features/editor/components/Generation/GenerationModal';
import { ErrorFallback } from '@/components/error-fallback';
import { FullPageLoader } from '@/components/full-page-loader';
import type { Project, ProjectFile, ProjectFileKind } from '@/types/api';

function EditorShell({ project, files, filesLoading }: { project: Project; files: ProjectFile[]; filesLoading: boolean }) {
  const { state } = useEditorContext();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [genLayerFileId, setGenLayerFileId] = useState<string | undefined>(undefined);
  const [genLayerStem, setGenLayerStem] = useState<string | undefined>(undefined);
  const [saveVersion, setSaveVersion] = useState(0);

  const slideFiles = files.filter((f) => f.layer === 'slide');
  const activeLayers = [...new Set(files.map((f) => f.layer))] as ProjectFileKind[];

  const handleSave = useCallback(() => {
    setSaveVersion((v) => v + 1);
  }, []);

  const handleOpenGeneration = useCallback(() => {
    setGenLayerFileId(undefined);
    setGenLayerStem(undefined);
    setGenModalOpen(true);
  }, []);

  const handleGenerateLayer = useCallback((stem: string) => {
    const slideFile = files.find((f) => f.name === stem && f.layer === 'slide');
    setGenLayerFileId(slideFile?.id);
    setGenLayerStem(stem);
    setGenModalOpen(true);
  }, [files]);

  return (
    <div className="flex flex-1 flex-col">
      <EditorToolbar projectName={project.name} onSave={handleSave} onOpenSettings={() => setSettingsOpen(true)} />
      <ProjectSettingsPanel projectId={project.id} open={settingsOpen} onOpenChange={setSettingsOpen} />

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-64 shrink-0 flex-col border-r border-(--bor2) bg-(--sur)">
          <SlideLibraryPanel projectId={project.id} files={files} onGenerateLayer={handleGenerateLayer} />
        </aside>

        <section className="flex flex-1 overflow-hidden">
          <PreviewCanvas files={files} direction={project.direction} />
        </section>

        <aside className="flex w-72 shrink-0 flex-col border-l border-(--bor2) bg-(--sur)">
          <PropertiesPanel projectId={project.id} files={files} filesLoading={filesLoading} onOpenGeneration={handleOpenGeneration} saveVersion={saveVersion} />
        </aside>
      </div>

      <EditorStatusBar
        slideIndex={slideFiles.length > 0 ? 1 : 0}
        totalSlides={slideFiles.length}
        selectedElement={state.selectedElement}
        activeLayers={activeLayers}
      />

      <GenerationModal
        projectId={project.id}
        fileId={genLayerFileId}
        stem={genLayerStem}
        files={files}
        open={genModalOpen}
        onOpenChange={setGenModalOpen}
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

  const {
    data: filesResponse,
    isLoading: filesLoading,
    isError: filesError,
    error: filesErr,
    refetch: refetchFiles,
  } = useProjectFiles(projectId);

  if (projectError) {
    return <ErrorFallback error={projectErr as Error} reset={refetchProject} />;
  }

  if (filesError) {
    return <ErrorFallback error={filesErr as Error} reset={refetchFiles} />;
  }

  if (projectLoading || filesLoading || !project) {
    return <FullPageLoader label="Loading editor..." />;
  }

  const files = filesResponse?.data ?? [];

  return (
    <EditorProvider>
      <EditorShell project={project} files={files} filesLoading={filesLoading} />
    </EditorProvider>
  );
}
