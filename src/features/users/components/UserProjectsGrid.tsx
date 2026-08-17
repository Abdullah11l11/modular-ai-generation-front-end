import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { FolderKanban } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Id } from '@/types/api';
import { useUserProjects } from '@/features/users/hooks/useUserProjects';

type UserProjectsGridProps = { userId: Id };

export function UserProjectsGrid({ userId }: UserProjectsGridProps) {
  const { data, error, isLoading } = useUserProjects(userId);
  if (isLoading)
    return (
      <div className="grid grid-cols-3 gap-4">
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
    <div className="grid grid-cols-3 gap-4">
      {items.map((project) => (
        <Link key={project.id} to={`/editor/projects/${project.id}`}>
          <Card className="transition-colors hover:bg-(--sur-h)">
            <CardHeader>
              <CardTitle className="text-sm">{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge>{project.status}</Badge>
              {project.origin_template_name && (
                <p className="mt-1 text-xs text-(--t3)">from: {project.origin_template_name}</p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
