import { useQuery } from '@tanstack/react-query';
import { getGenerationJob } from '@/features/generation/api/getGenerationJob';
import type { Id } from '@/types/api';

export const useGenerationJob = (jobId: Id) =>
  useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => getGenerationJob(jobId),
  });
