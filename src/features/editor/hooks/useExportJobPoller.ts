import { useQuery } from '@tanstack/react-query';
import { getExportJob } from '@/features/export/api/getExportJob';
import type { Id } from '@/types/api';

export function useExportJobPoller(jobId: Id | null) {
  return useQuery({
    queryKey: ['export-jobs', 'poll', jobId],
    queryFn: () => getExportJob(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2500;
      if (data.status === 'ready' || data.status === 'failed') return false;
      return 2500;
    },
  });
}
