import { useComments } from '@/features/social/hooks/useComments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/format';
import type { Comment, Id } from '@/types/api';

type TemplateCommentsProps = {
  templateId: Id;
};

export function TemplateComments({ templateId }: TemplateCommentsProps) {
  const { data, isLoading } = useComments('templates', templateId);
  const comments = data?.data ?? [];

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

  if (comments.length === 0) {
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
        {comments.map((comment: Comment) => {
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
                <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--t2)]">{comment.content}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}