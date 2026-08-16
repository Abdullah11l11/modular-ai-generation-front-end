import { Link } from 'react-router-dom';
import type { Template } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type TemplateCardProps = {
  template: Template;
};

export function TemplateCard({ template }: TemplateCardProps) {
  const initial = template.name.charAt(0).toUpperCase();
  const typeName = template.type?.name ?? 'Untyped';

  return (
    // Stretched-link pattern: outer `<div>` is the styled card; the main
    // navigation Link is absolutely positioned and z-index: 0 so it covers
    // the entire card. The author avatar Link sits above (z-index: 10) and
    // receives its own click. This avoids nested `<a>` (which produces a
    // React hydration error in React 19) while preserving middle-click →
    // open in new tab on both targets.
    <div className="group/card relative flex cursor-pointer flex-col overflow-hidden rounded-(--r12,12px) bg-(--sur) shadow-sm ring-1 ring-(--bor2)/50 transition-all duration-150 hover:-translate-y-px hover:shadow-md focus-within:ring-2 focus-within:ring-(--cy)">
      <Link
        to={`/templates/${template.id}`}
        aria-label={`View template ${template.name}`}
        className="absolute inset-0 z-0"
      />

      <div className="flex aspect-16/10 items-center justify-center bg-(--sur2) text-(--cy)">
        <span className="text-3xl font-extrabold tracking-tight opacity-30">{initial}</span>
      </div>

      <div className="flex flex-col gap-2 p-(--space-card-pad,15px)">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-[13px] font-bold text-(--t1)">{template.name}</h3>
            <p className="text-[11px] font-medium text-(--t3)">{typeName}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-[11px]">
            {typeName}
          </Badge>

          <div className="relative z-10 flex items-center gap-1.5 text-[11px] font-medium text-(--t2)">
            {template.author && (
              <Link
                to={`/users/${template.author.id}`}
                className="flex items-center no-underline hover:opacity-80"
                aria-label={`View ${template.author.name ?? 'user'}'s profile`}
              >
                <Avatar className="size-4">
                  <AvatarImage src={template.author.avatar_url ?? ''} />
                  <AvatarFallback className="text-[8px]">
                    {template.author.name?.charAt(0) ?? 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
            <span>{template.upvote_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
