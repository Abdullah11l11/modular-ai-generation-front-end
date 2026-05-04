import type { AiProvider } from '@/features/me/types/aiProvider'
import type { UpsertAiProviderRequest } from '@/features/me/types/upsertAiProviderRequest'
import { apiClient } from '@/lib/api/client'
import type { Id } from '@/types/api'

export const updateAiProvider = (
  providerId: Id,
  payload: UpsertAiProviderRequest,
) =>
  apiClient.put<AiProvider, UpsertAiProviderRequest>(
    `me/ai-providers/${providerId}`,
    payload,
  )
