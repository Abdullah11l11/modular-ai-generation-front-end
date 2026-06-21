import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useResources } from '@/features/resources/hooks/useResources';
import { ResourcesGrid } from '@/features/resources/components/resourcesGrid';
import type { ResourceKind } from '@/types/api';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';

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

export function ResourcePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const kindParam = searchParams.get('kind') as ResourceKind | null;
  const qParam = searchParams.get('q') ?? '';
  const activeKind = kindParam ?? 'all';
  const [search, setSearch] = useState(qParam);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (search) next.set('q', search);
      else next.delete('q');
      setSearchParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useResources({
    kind: activeKind === 'all' ? undefined : activeKind,
    q: qParam || undefined,
  });

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
        subtitle={
          data?.meta.total
            ? `${data.meta.total} resources`
            : 'Reusable prompts, skills, agents, and rules'
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
      {isLoading ? (
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
      ) : !data?.data.length ? (
        <EmptyState
          title="No resources found"
          description={
            activeKind !== 'all'
              ? `No ${activeKind} resources match your search.`
              : 'No resources yet. Create the first one!'
          }
        />
      ) : (
        <ResourcesGrid resources={data.data} />
      )}
    </div>
  );
}
