import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '@/features/projects/hooks/useProject';
import { EditorToolbar } from '@/features/editor/components/EditorToolbar';
import { ProjectSettingsPanel } from '@/features/projects/components/ProjectSettingsPanel';
import { FullPageLoader } from '@/components/full-page-loader';
import { ErrorFallback } from '@/components/error-fallback';
import type { Id } from '@/types/api';

export function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading, isError, refetch } = useProject(projectId as Id);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (isError || !project) {
    return (
      <ErrorFallback
        error={
          new Error(
            'Could not load this project. It may have been deleted or you may not have access.',
          )
        }
        reset={() => refetch()}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <EditorToolbar project={project} onOpenSettings={() => setSettingsOpen(true)} />
      <div className="flex flex-1 items-center justify-center text-(--t3) text-sm">
        Editor canvas will be built in a future phase.
      </div>

      <ProjectSettingsPanel
        projectId={projectId as Id}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}
