import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client';
import { formatRelativeTime } from '@/lib/format';
import type { Id, PaginatedResponse } from '@/types/api';

type Comment = {
  id: Id;
  body: string;
  created_at: string;
  author?: { id: Id; name: string; avatar_url?: string | null };
};

type TemplateCommentsProps = {
  templateId: Id;
};

async function fetchComments(templateId: Id): Promise<Comment[]> {
  try {
    const res = await apiClient.get<PaginatedResponse<Comment>>(`templates/${templateId}/comments`);
    return res.data ?? [];
  } catch {
    return [];
  }
}

export function TemplateComments({ templateId }: TemplateCommentsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['templates', templateId, 'comments'],
    queryFn: () => fetchComments(templateId),
    retry: false,
  });

  if (isLoading) {
    return (
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--t1)]">Comments</h2>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-md" />
          ))}
        </div>
      </section>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--t1)]">Comments</h2>
        <p className="text-sm text-[var(--t3)]">No comments yet.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[var(--t1)]">Comments</h2>
      <ul className="space-y-3">
        {data.map((comment) => {
          const initial = comment.author?.name?.trim().charAt(0).toUpperCase() ?? '?';
          return (
            <li key={comment.id} className="flex gap-3 rounded-md border border-[var(--bor)] bg-[var(--sur)] p-3">
              <Avatar className="size-7">
                {comment.author?.avatar_url ? (
                  <AvatarImage src={comment.author.avatar_url} alt={comment.author.name} />
                ) : null}
                <AvatarFallback className="bg-[var(--acc)] text-[10px] font-bold text-[var(--sur)]">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-[var(--t1)]">{comment.author?.name ?? 'Unknown'}</span>
                  <span className="text-[var(--t3)]">{formatRelativeTime(comment.created_at)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--t2)]">{comment.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}