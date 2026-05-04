import type { ForkTemplateRequest } from '@/features/templates/types/forkTemplateRequest'
import { apiClient } from '@/lib/api/client'
import type { Id, Template } from '@/types/api'

export const forkTemplate = (templateId: Id, payload: ForkTemplateRequest) =>
  apiClient.post<Template, ForkTemplateRequest>(
    `templates/${templateId}/fork`,
    payload,
  )
