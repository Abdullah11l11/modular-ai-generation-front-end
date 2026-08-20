import { useTemplates } from '@/features/templates/hooks/useTemplates';
import { TemplateGrid } from '@/features/templates/components/TemplateGrid';
import type { Template } from '@/types/api';

type RelatedTemplatesStripProps = {
  template: Template;
};

export function RelatedTemplatesStrip({ template }: RelatedTemplatesStripProps) {
  const firstTag = template.tags?.[0];

  const { data, isLoading } = useTemplates(
    { tags: firstTag, per_page: 4 },
    { enabled: !!firstTag },
  );

  if (!firstTag) return null;

  const items = (data?.data ?? []).filter((t) => t.id !== template.id).slice(0, 4);

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[var(--t1)]">Related templates</h2>
      <TemplateGrid templates={items} isLoading={isLoading} />
    </section>
  );
}
