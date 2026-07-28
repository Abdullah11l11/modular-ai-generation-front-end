import type { CreateProjectRequest } from '@/features/projects/types/createProjectRequest'
import { apiClient } from '@/lib/api/client'
import type { Project } from '@/types/api'

export const createProject = (payload: CreateProjectRequest) =>
  apiClient.post<Project, CreateProjectRequest>('projects', payload)
