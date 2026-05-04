import type { UpdateProjectRequest } from '@/features/projects/types/updateProjectRequest'
import { apiClient } from '@/lib/api/client'
import type { Id, Project } from '@/types/api'

export const updateProject = (projectId: Id, payload: UpdateProjectRequest) =>
  apiClient.put<Project, UpdateProjectRequest>(
    `projects/${projectId}`,
    payload,
  )
