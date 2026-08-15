import { useQuery } from '@tanstack/react-query';
import { getExportJob } from '@/features/export/api/getExportJob';
import type { Id } from '@/types/api';

export const useExportJob = (jobId: Id) =>
  useQuery({
    queryKey: ['export-jobs', jobId],
    queryFn: () => getExportJob(jobId),
  });
