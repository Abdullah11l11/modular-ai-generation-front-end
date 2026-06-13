import { useState } from 'react';
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
import { PlusIcon, FolderOpenIcon, SearchIcon } from 'lucide-react';
import type { Project } from '@/types/api';

const statusTabs: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const statusValue = (v: string): Project['status'] | undefined =>
  v === 'all' ? undefined : v as Project['status'];

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');

  const debouncedSearch = useDebounce(searchInput, 300);
  const params = {
    status: statusValue(statusFilter),
    q: debouncedSearch || undefined,
  };
  const { data, isLoading, isError, error, refetch } = useProjects(params);
  const projects = data?.data ?? [];
  const hasActiveFilter = statusFilter !== 'all' || debouncedSearch.length > 0;

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

      {!isLoading && projects.length === 0 ? (
        hasActiveFilter ? (
          <EmptyState
            title="No matching projects"
            description={
              debouncedSearch
                ? `No projects match "${debouncedSearch}"`
                : `No ${statusFilter} projects yet`
            }
            action={
              <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('all'); setSearchInput(''); }}>
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
        <ProjectGrid projects={projects} isLoading={isLoading} />
      )}

      <CreateProjectModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
