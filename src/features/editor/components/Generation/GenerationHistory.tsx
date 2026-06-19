import { useGenerationJobs } from '@/features/generation/hooks/useGenerationJobs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Id } from '@/types/api';

type GenerationHistoryProps = {
  projectId: Id;
};

const STATUS_COLORS: Record<string, string> = {
  succeeded: 'border-green-500/40 bg-green-500/10 text-green-400',
  failed: 'border-red-500/40 bg-red-500/10 text-red-400',
  running: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  queued: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
};

const STATUS_LABELS: Record<string, string> = {
  queued: 'Queued',
  running: 'Running',
  succeeded: 'Completed',
  failed: 'Failed',
};

export function GenerationHistory({ projectId }: GenerationHistoryProps) {
  const { data, isLoading, isError } = useGenerationJobs(projectId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    );
  }

  const jobs = data?.data ?? [];

  if (isError || jobs.length === 0) {
    return (
      <p className="text-xs text-(--t3)">No generation history yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="flex items-center justify-between rounded-md border border-(--bor2) bg-(--bg) px-2.5 py-2"
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-xs font-medium text-(--t1) capitalize">
              {job.target}
            </span>
            <span className="text-[10px] text-(--t3)">
              {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>

          <Badge
            variant="outline"
            className={`text-[10px] font-medium ${STATUS_COLORS[job.status] ?? ''}`}
          >
            {STATUS_LABELS[job.status] ?? job.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}
