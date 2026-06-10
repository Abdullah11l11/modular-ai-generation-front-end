import type { AiProvider } from '@/features/me/types/aiProvider';
import type { UpsertAiProviderRequest } from '@/features/me/types/upsertAiProviderRequest';
import { apiClient } from '@/lib/api/client';

export const createAiProvider = (payload: UpsertAiProviderRequest) =>
  apiClient.post<AiProvider, UpsertAiProviderRequest>('me/ai-providers', payload);
