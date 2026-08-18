import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { Id, OutputType, Template } from '@/types/api';
import { TemplateGrid } from '@/features/templates/components/TemplateGrid';
import { useTemplates } from '@/features/templates/hooks/useTemplates';
import { useTypes } from '@/features/types/hooks/useTypes';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortKey = 'popular' | 'newest' | 'most_forked';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'popular', label: 'Most popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'most_forked', label: 'Most forked' },
];

const PER_PAGE = 20;

export function TemplatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type') as Id | null;
  const qParam = searchParams.get('q') ?? '';
  const sortParam = (searchParams.get('sort') as SortKey | null) ?? 'popular';
  const activeType = typeParam ?? 'all';

  const [search, setSearch] = useState(qParam);
  const [page, setPage] = useState(1);
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);

  const typesQuery = useTypes();
  const types: OutputType[] = typesQuery.data ?? [];

  // Sync search input → URL after a short debounce; reset paging.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (search) next.set('q', search);
      else next.delete('q');
      setSearchParams(next, { replace: true });
      setPage(1);
      setAllTemplates([]);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Reset paging when type or sort changes.
  useEffect(() => {
    setPage(1);
    setAllTemplates([]);
  }, [activeType, sortParam]);

  const { data, isLoading, isFetching, isError } = useTemplates({
    q: qParam || undefined,
    type_id: activeType === 'all' ? undefined : activeType,
    sort: sortParam,
    page,
    per_page: PER_PAGE,
  });

  useEffect(() => {
    if (!data?.data) return;
    setAllTemplates((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
  }, [data, page]);

  const meta = data?.meta;
  const hasMore = !!meta && meta.current_page < meta.last_page;

  const setType = (typeId: string) => {
    const next = new URLSearchParams(searchParams);
    if (typeId === 'all') next.delete('type');
    else next.set('type', typeId);
    setSearchParams(next, { replace: true });
  };

  const setSort = (sort: string) => {
    const next = new URLSearchParams(searchParams);
    if (sort === 'popular') next.delete('sort');
    else next.set('sort', sort);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <PageHeader
        title="Templates"
        subtitle={
          meta?.total ? `${meta.total} templates` : 'Start from a polished template'
        }
        actions={
          <Button asChild size="sm">
            <Link to="/templates/new">
              <Plus className="size-4" />
              New template
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setType('all')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors',
              activeType === 'all'
                ? 'bg-(--cy) text-(--cy-fg)'
                : 'bg-(--sur) text-(--t2) hover:bg-(--sur-h)',
            )}
          >
            All
          </button>
          {typesQuery.isLoading ? (
            <Skeleton className="h-6 w-24 rounded-lg" />
          ) : (
            types.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                  activeType === t.id
                    ? 'bg-(--cy) text-(--cy-fg)'
                    : 'bg-(--sur) text-(--t2) hover:bg-(--sur-h)',
                )}
              >
                {t.name}
              </button>
            ))
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortParam} onValueChange={setSort}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      {isError ? (
        <EmptyState
          title="Failed to load templates"
          description="Something went wrong. Please try again."
        />
      ) : isLoading && page === 1 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : allTemplates.length === 0 ? (
        <EmptyState
          title="No templates found"
          description={
            activeType !== 'all'
              ? 'No templates of this type match your search.'
              : 'No templates yet.'
          }
        />
      ) : (
        <>
          <TemplateGrid templates={allTemplates} isLoading={isLoading} />
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={isFetching}
              >
                {isFetching ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}