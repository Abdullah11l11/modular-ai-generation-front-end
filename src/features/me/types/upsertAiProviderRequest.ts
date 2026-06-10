import type { AiProvider } from '@/features/me/types/aiProvider';

export type UpsertAiProviderRequest = Partial<AiProvider> & {
  provider?: AiProvider['provider'];
  api_key?: string | null;
};
