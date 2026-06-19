import { useQuery } from '@tanstack/react-query';
import { getGenerationJob } from '@/features/generation/api/getGenerationJob';
import type { AiJob, Id } from '@/types/api';

const TERMINAL_STATUSES: AiJob['status'][] = ['succeeded', 'failed'];

export function useJobPoller(jobId: Id | null) {
  return useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => getGenerationJob(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data as AiJob | undefined;
      if (!data || TERMINAL_STATUSES.includes(data.status)) return false;
      return 2000;
    },
  });
}
