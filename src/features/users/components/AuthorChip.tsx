import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/format';
import type { UserSummary } from '@/types/api';

type AuthorChipProps = {
  author: Pick<UserSummary, 'id' | 'name' | 'avatar_url'>;
  createdAt?: string | null;
  className?: string;
  linkToProfile?: boolean;
};

export function AuthorChip({ author, createdAt, className, linkToProfile = true }: AuthorChipProps) {
  const initial = author.name?.trim().charAt(0).toUpperCase() || '?';
  const created = createdAt ? ` · ${formatRelativeTime(createdAt)}` : '';

  const inner = (
    <>
      <Avatar className="size-6">
        {author.avatar_url ? <AvatarImage src={author.avatar_url} alt={author.name} /> : null}
        <AvatarFallback className="bg-[var(--acc)] text-[10px] font-bold text-[var(--sur)]">
          {initial}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm text-[var(--t1)]">{author.name}</span>
      {created ? <span className="text-xs text-[var(--t3)]">{created}</span> : null}
    </>
  );

  if (!linkToProfile) {
    return <div className={cn('flex items-center gap-2', className)}>{inner}</div>;
  }

  return (
    <Link
      to={`/users/${author.id}`}
      className={cn(
        'flex items-center gap-2 rounded-md no-underline transition-colors hover:bg-[var(--sur2)]',
        className,
      )}
    >
      {inner}
    </Link>
  );
}
