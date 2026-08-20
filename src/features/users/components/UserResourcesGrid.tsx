import { useUserResources } from '@/features/users/hooks/useUserResources';
import { ResourcesGrid } from '@/features/resources/components/resourcesGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { Library } from 'lucide-react';
import type { Id } from '@/types/api';

type UserResourcesGridProps = { userId: Id };

export function UserResourcesGrid({ userId }: UserResourcesGridProps) {
  const { data, isLoading, error } = useUserResources(userId);
  if (isLoading)
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  if (error) return <p className="text-red-500">Failed to load resources</p>;
  const items = data?.data ?? [];
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Library className="size-6" />}
        title="No resources yet"
        description="This user has not published any resources."
      />
    );
  }
  return <ResourcesGrid resources={items} />;
}
