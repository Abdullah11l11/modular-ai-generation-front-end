import { useState, useEffect, useMemo } from 'react';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { ProjectGrid } from '@/features/projects/components/ProjectGrid';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { ErrorFallback } from '@/components/error-fallback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/useDebounce';
import { PlusIcon, FolderOpenIcon, SearchIcon, Loader2Icon } from 'lucide-react';
import type { Project } from '@/types/api';

const statusTabs: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const statusValue = (v: string): Project['status'] | undefined =>
  v === 'all' ? undefined : (v as Project['status']);

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [loadedProjects, setLoadedProjects] = useState<Project[]>([]);

  const debouncedSearch = useDebounce(searchInput, 300);

  const params = useMemo(
    () => ({
      page,
      per_page: 12,
      status: statusValue(statusFilter),
      q: debouncedSearch || undefined,
    }),
    [page, statusFilter, debouncedSearch],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useProjects(params);
  const hasMore = data ? data.meta.current_page < data.meta.last_page : false;

  useEffect(() => {
    setPage(1);
    setLoadedProjects([]);
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    if (!data) return;
    if (data.meta.current_page === 1) {
      setLoadedProjects(data.data);
    } else {
      setLoadedProjects((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newProjects = data.data.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newProjects];
      });
    }
  }, [data]);

  if (isError) {
    return <ErrorFallback error={error as Error} reset={refetch} />;
  }

  return (
    <div>
      <PageHeader
        title="My Projects"
        subtitle={`${data?.meta.total ?? 0} project${data?.meta.total !== 1 ? 's' : ''}`}
        actions={
          <Button variant="accent" size="sm" onClick={() => setModalOpen(true)}>
            <PlusIcon className="size-3.5" />
            New Project
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-(--t3)" />
          <Input
            placeholder="Search projects..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList variant="line">
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {!isLoading && loadedProjects.length === 0 ? (
        statusFilter !== 'all' || debouncedSearch.length > 0 ? (
          <EmptyState
            title="No matching projects"
            description={
              debouncedSearch
                ? `No projects match "${debouncedSearch}"`
                : `No ${statusFilter} projects yet`
            }
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchInput('');
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<FolderOpenIcon className="size-5" />}
            title="No projects yet"
            description="Create your first project by browsing templates or starting from scratch."
            action={
              <Button variant="accent" size="sm" onClick={() => setModalOpen(true)}>
                <PlusIcon className="size-3.5" />
                Create project
              </Button>
            }
          />
        )
      ) : (
        <>
          <ProjectGrid projects={loadedProjects} isLoading={isLoading} />
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={isFetching}
              >
                {isFetching && <Loader2Icon className="size-3.5 animate-spin" />}
                Load more
              </Button>
            </div>
          )}
        </>
      )}

      <CreateProjectModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
