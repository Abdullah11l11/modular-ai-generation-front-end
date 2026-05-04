import { apiClient } from '@/lib/api/client'
import type { Id, PaginatedResponse, ProjectFile } from '@/types/api'

export const listProjectFiles = (projectId: Id) =>
  apiClient.get<PaginatedResponse<ProjectFile>>(`projects/${projectId}/files`)
