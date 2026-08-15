// import { useQuery } from '@tanstack/react-query';
// import { getExportJob } from '@/features/export/api/getExportJob';
// import type { Id } from '@/types/api';

// export const useExportJob = (jobId: Id) =>
//   useQuery({
//     queryKey: ['export-jobs', jobId],
//     queryFn: () => getExportJob(jobId),
//   });
import { useQuery } from '@tanstack/react-query';
import { getExportJob } from '../api/getExportJob';

export function useExportJob(
  jobId: string | null,
) {
  return useQuery({
    queryKey: ['export-job', jobId],

    queryFn: () => {
      if (!jobId) {
        throw new Error('Export job ID is required');
      }

      return getExportJob(jobId);
    },

    enabled: Boolean(jobId),

    refetchInterval: (query) => {
      const status = query.state.data?.status;

      if (
        status === 'ready' ||
        status === 'failed'
      ) {
        return false;
      }

      return 2000;
    },
  });
}