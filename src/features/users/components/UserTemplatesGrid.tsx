import { useUserTemplates } from '@/features/users/hooks/useUserTemplates';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { LayoutTemplate } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Id } from '@/types/api';

type UserTemplatesGridProps = {
  userId: Id;
};

export function UserTemplatesGrid({ userId }: UserTemplatesGridProps) {
  const { data, isLoading, error } = useUserTemplates(userId);
  if (isLoading)
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  if (error) return <p className="text-red-500">Failed To Load Templates</p>;
  const items = data?.data ?? [];
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<LayoutTemplate className="size-6" />}
        title="No templates yet"
        description="This user has not published any templates."
      />
    );
  }
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((template) => (
        <Link key={template.id} to={`/templates/${template.id}`}>
          <Card className="transition-colors hover:bg-(--sur-h)">
            <CardHeader>
              <CardTitle className="text-sm">{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {template.type && <Badge>{template.type.name}</Badge>}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
