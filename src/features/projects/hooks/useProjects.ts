import { useQuery } from '@tanstack/react-query'
import { listProjects } from '@/features/projects/api/listProjects'
import type { ProjectListParams } from '@/features/projects/types/projectListParams'

export const useProjects = (params?: ProjectListParams) =>
  useQuery({
    queryKey: ['projects', params],
    queryFn: () => listProjects(params),
  })
