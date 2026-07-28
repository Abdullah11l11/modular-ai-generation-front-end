import type { ProjectListParams } from '@/features/projects/types/projectListParams'
import { apiClient } from '@/lib/api/client'
import type { PaginatedResponse, Project } from '@/types/api'

export const listProjects = (params?: ProjectListParams) =>
  apiClient.get<PaginatedResponse<Project>>('projects', { params })
