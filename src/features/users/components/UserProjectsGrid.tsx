import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Id, Project } from '@/types/api';
import { useUserProjects } from '@/features/users/hooks/useUserProjects';
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    user_id: '1',
    template_id: '1',
    origin_template_name: 'Business Pitch Deck',
    name: 'My Pitch Deck',
    description: null,
    status: 'published',
    visibility: 'public',
    tags: ['businesses'],
    locale: 'ar',
    direction: 'rtl',
    cloned_at: null,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-07-02T10:00:00Z',
  },
];
type UserProjectsGridProps = { userId: Id };
export function UserProjectsGrid({ userId }: UserProjectsGridProps) {
  const { data, error, isLoading } = useUserProjects(userId);
  if (isLoading)
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl"></Skeleton>
        ))}
      </div>
    );
  if (error) return <p className="text-red-500">Failed To Load Projects</p>;
  return (
    <div className="grid grid-cols-3 gap-4">
      {(data?.data ?? MOCK_PROJECTS).map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle className="text-sm">{project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>{project.status}</Badge>
            {project.origin_template_name && (
              <p className="text-xs text-gray-500 mt-1">from:{project.origin_template_name}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
