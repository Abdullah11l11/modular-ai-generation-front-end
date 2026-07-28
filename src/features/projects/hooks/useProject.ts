import { useQuery } from '@tanstack/react-query'
import { getProject } from '@/features/projects/api/getProject'
import type { Id } from '@/types/api'

export const useProject = (projectId: Id) =>
  useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProject(projectId),
  })
