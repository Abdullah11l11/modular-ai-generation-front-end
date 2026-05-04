import type { AiProvider } from '@/features/me/types/aiProvider'
import { apiClient } from '@/lib/api/client'

export const listAiProviders = () =>
  apiClient.get<AiProvider[]>('me/ai-providers')
