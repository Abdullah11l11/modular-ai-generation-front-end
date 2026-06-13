import { useState } from 'react';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useDeleteProject } from '@/features/projects/hooks/useDeleteProject';
import { ProjectGrid } from '@/features/projects/components/ProjectGrid';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { ErrorFallback } from '@/components/error-fallback';
import { Button } from '@/components/ui/button';
import { PlusIcon, FolderOpenIcon } from 'lucide-react';

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useProjects();
  const deleteProject = useDeleteProject();
  const projects = data?.data ?? [];

  if (isError) {
    return <ErrorFallback error={error as Error} reset={refetch} />;
  }

  return (
    <div>
      <PageHeader
        title="My Projects"
        subtitle={`${data?.meta.total ?? 0} project${data?.meta.total !== 1 ? 's' : ''}`}
        actions={
          <Button variant="accent" size="sm" onClick={() => setModalOpen(true)}>
            <PlusIcon className="size-3.5" />
            New Project
          </Button>
        }
      />

      {!isLoading && projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpenIcon className="size-5" />}
          title="No projects yet"
          description="Create your first project by browsing templates or starting from scratch."
          action={
            <Button variant="accent" size="sm" onClick={() => setModalOpen(true)}>
              <PlusIcon className="size-3.5" />
              Create project
            </Button>
          }
        />
      ) : (
        <ProjectGrid
          projects={projects}
          isLoading={isLoading}
          onDelete={(id) => deleteProject.mutate(id)}
        />
      )}

      <CreateProjectModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
