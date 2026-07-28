import type { GenerateFullRequest } from '@/features/generation/types/generateFullRequest'
import { apiClient } from '@/lib/api/client'
import type { AiJob, Id } from '@/types/api'

export const generateProject = (projectId: Id, payload: GenerateFullRequest) =>
  apiClient.post<AiJob, GenerateFullRequest>(
    `projects/${projectId}/generate`,
    payload,
  )
