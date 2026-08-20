import { useQueries } from '@tanstack/react-query';
import { listResources } from '@/features/resources/api/listResources';
import type { ResourceKind } from '@/types/api';

const KINDS: ResourceKind[] = ['prompt', 'skill', 'agent', 'rule', 'mcp', 'design_doc', 'hook'];

/**
 * Returns a record of kind -> count, fetched in parallel. One cheap
 * `per_page=1` request per kind. The data here is only used to label the
 * kind filter pills so the user can see at a glance what exists in the
 * database — we do not need the actual resource rows.
 */
export function useResourceKindCounts() {
  const results = useQueries({
    queries: KINDS.map((kind) => ({
      queryKey: ['resources', 'count', kind],
      queryFn: () => listResources({ kind, per_page: 1 }),
      staleTime: 30_000,
    })),
  });

  const counts: Partial<Record<ResourceKind | 'all', number>> = { all: undefined };
  results.forEach((r, i) => {
    if (r.data?.meta?.total !== undefined) {
      counts[KINDS[i]] = r.data.meta.total;
    }
  });
  return counts;
}
