import type { CreateFileRequest } from '@/features/files/types/createFileRequest'
import { apiClient } from '@/lib/api/client'
import type { Id, ProjectFile } from '@/types/api'

export const createProjectFile = (
  projectId: Id,
  payload: CreateFileRequest,
) =>
  apiClient.post<ProjectFile, CreateFileRequest>(
    `projects/${projectId}/files`,
    payload,
  )
