import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { FolderKanban } from 'lucide-react';
import type { Id } from '@/types/api';
import { useUserProjects } from '@/features/users/hooks/useUserProjects';
import { ProjectCard } from '@/features/projects/components/ProjectCard';

type UserProjectsGridProps = { userId: Id };

export function UserProjectsGrid({ userId }: UserProjectsGridProps) {
  const { data, error, isLoading } = useUserProjects(userId);
  if (isLoading)
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  if (error) return <p className="text-red-500">Failed To Load Projects</p>;
  const items = data?.data ?? [];
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<FolderKanban className="size-6" />}
        title="No projects yet"
        description="This user has not created any projects."
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
