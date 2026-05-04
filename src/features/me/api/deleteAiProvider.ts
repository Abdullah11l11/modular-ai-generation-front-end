import { apiClient } from '@/lib/api/client'
import type { Id } from '@/types/api'

export const deleteAiProvider = (providerId: Id) =>
  apiClient.delete(`me/ai-providers/${providerId}`)
