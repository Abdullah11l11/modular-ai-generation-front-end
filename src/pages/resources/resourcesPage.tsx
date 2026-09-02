import { useEffect, useState ,useRef} from 'react';
import { useSearchParams } from 'react-router-dom';
import { useResources } from '@/features/resources/hooks/useResources';
import { useResourceKindCounts } from '@/features/resources/hooks/useResourceKindCounts';
import { ResourcesGrid } from '@/features/resources/components/resourcesGrid';
import type { Resource, ResourceKind } from '@/types/api';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { ChevronDown, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DropdownMenu ,
  DropdownMenuContent ,
  DropdownMenuItem ,
  DropdownMenuTrigger ,
 } from '@/components/ui/dropdown-menu';
type SortKey = 'popular' | 'newest' | 'most_forked';

const KIND_OPTIONS: { label: string; value: ResourceKind | 'all' }[] = [
  { label: 'Prompt', value: 'prompt' },
  { label: 'Skill', value: 'skill' },
  { label: 'Agent', value: 'agent' },
  { label: 'Rule', value: 'rule' },
  { label: 'MCP', value: 'mcp' },
  { label: 'Design Doc', value: 'design_doc' },
  { label: 'Hook', value: 'hook' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'popular', label: 'Most popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'most_forked', label: 'Most forked' },
];

const PER_PAGE = 20;

export function ResourcePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const kindParam = searchParams.get('kind') as ResourceKind | null;
  const qParam = searchParams.get('q') ?? '';
  const sortParam = (searchParams.get('sort') as SortKey | null) ?? 'popular';
  const activeKind = kindParam ?? 'prompt';
  const [search, setSearch] = useState(qParam);
  const [page, setPage] = useState(1);
  const [all, setAll] = useState<Resource[]>([]);
  const kindCounts = useResourceKindCounts();
  const isFirstSearchRun =useRef(true) ;
  useEffect(()=>{
    if(isFirstSearchRun.current) {
      isFirstSearchRun.current=false ;
      return ;
    }
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
  }, [search]) ;

    

  useEffect(() => {
    setPage(1);
    setAll([]);
  }, [activeKind, sortParam]);

  const { data, isLoading, isFetching, error } = useResources({
    kind: activeKind ,
    q: qParam || undefined,
    sort: sortParam,
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

  const setSort = (sort: string) => {
    const next = new URLSearchParams(searchParams);
    if (sort === 'popular') next.delete('sort');
    else next.set('sort', sort);
    setSearchParams(next, { replace: true });
  };
 const activeLabel =
 KIND_OPTIONS.find((opt)=>opt.value===activeKind) ?.label?? 'prompt' ;
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
      <DropdownMenu>
        <div className="flex items-stretch  overflow-hidden border-2 rounded-xl  border-(--bor) bg-(--sur)">
          <span className='flex items-center px-8 py-1.5 text-xs font-medium text-(--t2)'>
            {activeLabel}
          </span>
          <DropdownMenuTrigger asChild>
            <button aria-label="Filter resources by kind " 
             className='flex cursor-pointer items-center border-l-2   border-(--bor) px-2.5  text-(--t2) transition-colors hover:bg-(--sur-h)'>
              <ChevronDown  className='size-4'/>
             </button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent align="start" className='w-44'>
          {KIND_OPTIONS.map((opt)=> (
            <DropdownMenuItem 
            key={opt.value}
            onClick={()=>setKind(opt.value)}
            className={cn('justify-between',
              activeKind==opt.value && 'font-semibold' 
            )}>
              <span>{opt.label}</span>
              {kindCounts[opt.value] !==undefined && (
                <span className="text-[10px] tabular-nums text-(--t3)">
                  {kindCounts[opt.value]}
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>


   
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
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
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
          `No ${activeKind} resources match your search.No resources yet. Create the first one!`
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
