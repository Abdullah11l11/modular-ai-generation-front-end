import { useQuery } from '@tanstack/react-query';
import { getGenerationJob } from '@/features/generation/api/getGenerationJob';
import type { Id } from '@/types/api';

export function useJobPoller(jobId: Id | null) {
  return useQuery({
    queryKey: ['jobs', 'poll', jobId],
    queryFn: () => getGenerationJob(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2500;
      if (data.status === 'succeeded' || data.status === 'failed') return false;
      return 2500;
    },
  });
}
