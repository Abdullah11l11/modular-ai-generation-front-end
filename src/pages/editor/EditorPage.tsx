import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { EditorProvider } from '@/features/editor/components/EditorProvider';
import { EditorToolbar } from '@/features/editor/components/EditorToolbar';
import { EditorStatusBar } from '@/features/editor/components/EditorStatusBar';
import { SlideLibraryPanel } from '@/features/editor/components/SlideLibrary/SlideLibraryPanel';
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
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  const slides = (filesData?.data ?? []).filter((f) => f.kind === 'slide');

  return (
    <div className="flex flex-1 flex-col">
      <EditorToolbar onOpenSettings={() => setSettingsOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <SlideLibraryPanel
          projectId={projectId as Id}
          slides={slides}
          filesLoading={false}
        />

        <div className="flex flex-1 items-center justify-center bg-(--bg)">
          <p className="text-sm text-(--t3)">Select a slide to preview</p>
        </div>

        <aside className="w-67.5 shrink-0 border-l border-(--bor2) bg-(--sur) p-3 overflow-y-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-(--t3)">
            Properties
          </div>
        </aside>
      </div>

      <EditorStatusBar />

      <ProjectSettingsPanel
        projectId={projectId as Id}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
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
