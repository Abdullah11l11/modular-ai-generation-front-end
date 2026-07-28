import { apiClient } from '@/lib/api/client'
import type { Id, Project } from '@/types/api'

export const getProject = (projectId: Id) =>
  apiClient.get<Project>(`projects/${projectId}`)
