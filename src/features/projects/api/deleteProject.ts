import { apiClient } from '@/lib/api/client'
import type { Id } from '@/types/api'

export const deleteProject = (projectId: Id) =>
  apiClient.delete(`projects/${projectId}`)
