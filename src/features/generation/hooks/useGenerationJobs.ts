import { useQuery } from '@tanstack/react-query'
import { listGenerationJobs } from '@/features/generation/api/listGenerationJobs'
import type { Id } from '@/types/api'

export const useGenerationJobs = (projectId: Id) =>
  useQuery({
    queryKey: ['projects', projectId, 'jobs'],
    queryFn: () => listGenerationJobs(projectId),
  })
