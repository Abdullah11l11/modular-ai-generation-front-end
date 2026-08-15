import { TemplateCard } from '@/features/templates/components/TemplateCard';
import type { Template } from '@/types/api';

type TemplateGridProps = {
  templates: Template[];
  isLoading?: boolean;
};

export function TemplateGrid({ templates, isLoading }: TemplateGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[12px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[260px] w-full animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[12px]">
      {templates.map((t) => (
        <TemplateCard key={t.id} template={t} />
      ))}
    </div>
  );
}
