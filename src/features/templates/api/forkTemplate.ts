import type { ForkTemplateRequest } from '@/features/templates/types/forkTemplateRequest'
import { apiClient } from '@/lib/api/client'
import type { Id, Project } from '@/types/api'

export const forkTemplate = (templateId: Id, payload: ForkTemplateRequest) =>
  apiClient.post<Project, ForkTemplateRequest>(
    `templates/${templateId}/fork`,
    payload,
  )
