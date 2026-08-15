import { useUserTemplates } from '@/features/users/hooks/useUserTemplates';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Id, Template } from '@/types/api';
const mockTemplates: Template[] = [
  {
    id: '1',
    user_id: '1',
    name: 'Business Pitch Deck',
    description: null,
    thumbnail_url: null,
    visibility: 'public',
    tags: ['business'],
    locale: 'en',
    direction: 'ltr',
    fork_count: 5,
    upvote_count: 12,
    is_upvoted: false,
    is_bookmarked: false,
    type: { id: '1', name: 'Presentation', description: '', icon: '' },
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-01-15T10:30:00Z',
  },
];
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
  const items = data?.data ?? mockTemplates;
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((template) => (
        <Card key={template.id}>
          <CardHeader>
            <CardTitle className="text-sm">{template.name}</CardTitle>
          </CardHeader>
          <CardContent>{template.type && <Badge>{template.type.name}</Badge>}</CardContent>
        </Card>
      ))}
    </div>
  );
}
