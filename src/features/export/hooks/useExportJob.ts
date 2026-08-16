import { useQuery } from '@tanstack/react-query';
import { getExportJob } from '@/features/export/api/getExportJob';
import type { Id } from '@/types/api';

export const useExportJob = (jobId: Id | null) =>
  useQuery({
    queryKey: ['export-jobs', jobId],
    queryFn: () => {
      if (!jobId) {
        throw new Error('Export job id is missing');
      }
      return getExportJob(jobId);
    },
    enabled: Boolean(jobId),
  });
