import type { Project } from '@/types/api';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';

type ProjectGridProps = {
  projects: Project[];
  isLoading?: boolean;
  onDelete?: (projectId: string) => void;
};

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-(--r12,12px) bg-(--sur) shadow-sm ring-1 ring-(--bor2)/50">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="flex flex-col gap-2 p-(--space-card-pad,15px)">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ProjectGrid({ projects, isLoading, onDelete }: ProjectGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-(--space-card-gap,12px) sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-(--space-card-gap,12px) sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onDelete={onDelete} />
      ))}
    </div>
  );
}
