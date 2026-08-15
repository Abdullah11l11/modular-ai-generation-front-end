import { useState, useEffect } from 'react';
import type { Template } from '@/types/api';
import { TemplateGrid } from '@/features/templates/components/TemplateGrid';
import { useTemplates } from '@/features/templates/hooks/useTemplates';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { useDebounce } from '@/hooks/useDebounce';

export function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useTemplates({
    q: debouncedSearch,
    page,
    per_page: 20,
  });

  useEffect(() => {
    if (!data?.data) return;

    if (page === 1) {
      setAllTemplates(data.data);
    } else {
      setAllTemplates((prev) => [...prev, ...data.data]);
    }
  }, [data, page]);

  if (isError) {
    return <div className="text-center text-red-500">Something went wrong.</div>;
  }

  const meta = data?.meta;
  const hasMore = meta && meta.current_page < meta.last_page;

  return (
    <div className="space-y-6">
      <PageHeader title="Templates" subtitle={`${meta?.total ?? 0} results`} />

      <Input
        placeholder="Search templates..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-md"
      />

      <TemplateGrid templates={allTemplates} isLoading={isLoading} />

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="rounded-(--r8) bg-(--sur2) px-4 py-2 text-(--t1) hover:bg-(--sur3) transition"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
