import { useParams } from 'react-router-dom';
import { EditorProvider } from '@/features/editor/components/EditorProvider';
import { EditorToolbar } from '@/features/editor/components/EditorToolbar';
import { EditorStatusBar } from '@/features/editor/components/EditorStatusBar';
import { useProject } from '@/features/projects/hooks/useProject';
import { useProjectFiles } from '@/features/files/hooks/useProjectFiles';
import { FullPageLoader } from '@/components/full-page-loader';
import { ErrorFallback } from '@/components/error-fallback';
import { Button } from '@/components/ui/button';

function EditorContent() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(projectId!);
  const { isLoading: filesLoading } = useProjectFiles(projectId!);

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

  return (
    <div className="flex flex-1 flex-col">
      <EditorToolbar />

      <div className="flex flex-1 items-center justify-center bg-(--bg)">
        <p className="text-sm text-(--t3)">Select a slide to preview</p>
      </div>

      <EditorStatusBar />
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
