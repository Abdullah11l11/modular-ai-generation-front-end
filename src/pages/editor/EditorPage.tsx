import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { EditorProvider } from '@/features/editor/components/EditorProvider';
import { EditorToolbar } from '@/features/editor/components/EditorToolbar';
import { EditorStatusBar } from '@/features/editor/components/EditorStatusBar';
import { SlideLibraryPanel } from '@/features/editor/components/SlideLibrary/SlideLibraryPanel';
import { PreviewCanvas } from '@/features/editor/components/Preview/PreviewCanvas';
import { PropertiesPanel } from '@/features/editor/components/PropertiesPanel/PropertiesPanel';
import { GenerationModal } from '@/features/editor/components/Generation/GenerationModal';
import { ExportDialog } from '@/features/editor/components/Export/ExportDialog';
import { useEditorStore } from '@/features/editor/hooks/useEditorStore';
import { ProjectSettingsPanel } from '@/features/projects/components/ProjectSettingsPanel';
import { useProject } from '@/features/projects/hooks/useProject';
import { useProjectFiles } from '@/features/files/hooks/useProjectFiles';
import { FullPageLoader } from '@/components/full-page-loader';
import { ErrorFallback } from '@/components/error-fallback';
import { Button } from '@/components/ui/button';
import type { Id } from '@/types/api';

function EditorContent() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(projectId!);
  const { data: filesData, isLoading: filesLoading } = useProjectFiles(projectId!);
  const { state } = useEditorStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [genLayerFileId, setGenLayerFileId] = useState<Id | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const handleOpenGenerationModal = () => {
    setGenLayerFileId(null);
    setGenModalOpen(true);
  };

  const handleGenerateLayer = (fileId: string) => {
    setGenLayerFileId(fileId);
    setGenModalOpen(true);
  };

  if (projectLoading || filesLoading) {
    return <FullPageLoader />;
  }

  if (projectError || !project) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <ErrorFallback
          error={new Error('Failed to load project.')}
          reset={() => window.location.reload()}
        />
      </div>
    );
  }

  const allFiles = filesData?.data ?? [];
  const slides = allFiles.filter((f) => f.layer === 'slide');
  const selectedSlide = allFiles.find((f) => f.id === state.selectedSlideId) ?? null;
  const styleFile = allFiles.find((f) => f.layer === 'style') ?? null;
  const layoutFile = allFiles.find((f) => f.layer === 'layout') ?? null;
  const contextFile = allFiles.find((f) => f.layer === 'context') ?? null;

  return (
    <div className="flex flex-1 flex-col">
      <EditorToolbar onOpenSettings={() => setSettingsOpen(true)} onOpenExport={() => setExportOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <SlideLibraryPanel
          projectId={projectId as Id}
          slides={slides}
          filesLoading={false}
          onGenerateLayer={handleGenerateLayer}
        />

        <PreviewCanvas
          project={project}
          selectedSlide={selectedSlide}
          styleFile={styleFile}
          layoutFile={layoutFile}
        />

        <PropertiesPanel
          projectId={projectId as Id}
          selectedSlide={selectedSlide}
          styleFile={styleFile}
          layoutFile={layoutFile}
          filesLoading={filesLoading}
          onOpenGenerationModal={handleOpenGenerationModal}
        />
      </div>

      <EditorStatusBar />

      <ProjectSettingsPanel
        projectId={projectId as Id}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />

      <ExportDialog
        projectId={projectId as Id}
        open={exportOpen}
        onOpenChange={setExportOpen}
      />

      <GenerationModal
        projectId={projectId as Id}
        open={genModalOpen}
        onOpenChange={setGenModalOpen}
        fileId={genLayerFileId}
        contextContent={contextFile?.content ?? undefined}
        files={allFiles}
      />
    </div>
  );
}

export default function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="text-sm font-semibold text-(--t1)">Invalid URL</h2>
        <p className="max-w-xs text-xs text-(--t2)">Missing project ID in URL.</p>
        <Button variant="outline" size="sm" onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <EditorProvider projectId={projectId}>
      <EditorContent />
    </EditorProvider>
  );
}
