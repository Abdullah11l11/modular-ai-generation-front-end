import type { AiProvider } from '@/features/me/types/aiProvider'
import { apiClient } from '@/lib/api/client'

type ListAiProvidersResponse = {
  data: AiProvider[]
}

export const listAiProviders = () =>
  apiClient.get<ListAiProvidersResponse>('me/ai-providers')
