import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useResources } from '@/features/resources/hooks/useResources';
import { ResourcesGrid } from '@/features/resources/components/resourcesGrid';
import type { Resource, ResourceKind } from '@/types/api';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const KIND_OPTIONS: { label: string; value: ResourceKind | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Prompt', value: 'prompt' },
  { label: 'Skill', value: 'skill' },
  { label: 'Agent', value: 'agent' },
  { label: 'Rule', value: 'rule' },
  { label: 'MCP', value: 'mcp' },
  { label: 'Design Doc', value: 'design_doc' },
  { label: 'Hook', value: 'hook' },
];

const PER_PAGE = 20;

export function ResourcePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const kindParam = searchParams.get('kind') as ResourceKind | null;
  const qParam = searchParams.get('q') ?? '';
  const activeKind = kindParam ?? 'all';
  const [search, setSearch] = useState(qParam);
  const [page, setPage] = useState(1);
  const [all, setAll] = useState<Resource[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (search) next.set('q', search);
      else next.delete('q');
      setSearchParams(next, { replace: true });
      setPage(1);
      setAll([]);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    setPage(1);
    setAll([]);
  }, [activeKind]);

  const { data, isLoading, error } = useResources({
    kind: activeKind === 'all' ? undefined : activeKind,
    q: qParam || undefined,
    page,
    per_page: PER_PAGE,
  });

  useEffect(() => {
    if (!data?.data) return;
    setAll((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
  }, [data, page]);

  const meta = data?.meta;
  const hasMore = !!meta && meta.current_page < meta.last_page;

  const setKind = (kind: string) => {
    const next = new URLSearchParams(searchParams);
    if (kind === 'all') next.delete('kind');
    else next.set('kind', kind);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <PageHeader
        title="Resources"
        subtitle={meta?.total ? `${meta.total} resources` : 'Reusable prompts, skills, agents, and rules'}
        actions={
          <Button asChild size="sm">
            <Link to="/resources/new">
              <Plus className="size-4" />
              New resource
            </Link>
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {KIND_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setKind(opt.value)}
              className={cn(
                'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                activeKind === opt.value
                  ? 'bg-(--cy) text-(--cy-fg)'
                  : 'bg-(--sur) text-(--t2) hover:bg-(--sur-h)',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Input
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      {isLoading && page === 1 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Failed to load resources"
          description="Something went wrong. Please try again."
        />
      ) : all.length === 0 ? (
        <EmptyState
          title="No resources found"
          description={
            activeKind !== 'all'
              ? `No ${activeKind} resources match your search.`
              : 'No resources yet. Create the first one!'
          }
        />
      ) : (
        <>
          <ResourcesGrid resources={all} />
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
