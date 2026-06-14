import { useGenerationJobs } from '@/features/generation/hooks/useGenerationJobs';
import { Badge } from '@/components/ui/badge';
import type { Id } from '@/types/api';

type GenerationHistoryProps = {
  projectId: Id;
};

const STATUS_COLORS: Record<string, string> = {
  queued: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  running: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  succeeded: 'bg-green-500/10 text-green-600 border-green-500/30',
  failed: 'bg-red-500/10 text-red-600 border-red-500/30',
};

export function GenerationHistory({ projectId }: GenerationHistoryProps) {
  const { data: jobsData, isLoading } = useGenerationJobs(projectId);

  const jobs = jobsData?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-(--sur3)" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <p className="rounded-lg border-2 border-dashed border-(--bor2) px-3 py-4 text-center text-[11px] text-(--t3)">
        No generation history yet
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {jobs.slice(0, 10).map((job) => (
        <div
          key={job.id}
          className="flex items-center justify-between rounded-lg border border-(--bor2) px-2.5 py-2"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium text-(--t1)">
              {job.target === 'project' ? 'Full project' : 'Layer generation'}
            </p>
            <p className="text-[10px] text-(--t3)">
              {new Date(job.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <Badge
            className={`ml-2 shrink-0 border text-[10px] font-semibold ${
              STATUS_COLORS[job.status] ?? 'bg-(--sur2) text-(--t3)'
            }`}
          >
            {job.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}
