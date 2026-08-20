import { Link } from 'react-router-dom';
import { GitFork } from 'lucide-react';
import { useTemplate } from '@/features/templates/hooks/useTemplate';
import type { Id } from '@/types/api';

type ForkedFromLineProps = {
  templateId: Id | null;
  fallbackName: string | null;
};

export function ForkedFromLine({ templateId, fallbackName }: ForkedFromLineProps) {
  // Only fetch when we have an id. The hook would otherwise be called with a fake id.
  const enabled = !!templateId;
  const { data: template, isError, isPending } = useTemplate(templateId ?? '');

  if (!templateId && !fallbackName) return null;

  // While loading, keep a stable placeholder so the layout doesn't jump.
  if (enabled && isPending && !template && !isError) {
    return (
      <p className="flex items-center gap-1 truncate text-[10px] text-(--t3)">
        <GitFork className="size-3 shrink-0" />
        <span className="truncate">Forked from {fallbackName ? <em>{fallbackName}</em> : '...'}</span>
      </p>
    );
  }

  // Template exists: link to template detail + author profile.
  if (template) {
    return (
      <p className="flex items-center gap-1 truncate text-[10px] text-(--t3)">
        <GitFork className="size-3 shrink-0" />
        <span className="truncate">
          Forked from{' '}
          <Link
            to={`/templates/${template.id}`}
            className="font-medium text-(--cy) hover:underline"
          >
            {template.name}
          </Link>
          {template.author ? (
            <>
              {' '}by{' '}
              <Link
                to={`/users/${template.author.id}`}
                className="text-(--t2) hover:underline"
              >
                {template.author.name}
              </Link>
            </>
          ) : null}
        </span>
      </p>
    );
  }

  // Template 404 (or any error): render a "parent removed" style note.
  return (
    <p className="flex items-center gap-1 truncate text-[10px] text-(--t3)">
      <GitFork className="size-3 shrink-0" />
      <span className="truncate">
        Forked from{' '}
        <em className="text-(--t2) not-italic">
          {fallbackName ?? 'a deleted template'}
        </em>
        {' '}
        <span className="text-(--err)">(parent removed)</span>
      </span>
    </p>
  );
}
