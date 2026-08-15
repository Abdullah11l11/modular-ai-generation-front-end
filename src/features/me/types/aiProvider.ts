import type { Id } from '@/types/api';

export type AiProvider = {
  id: Id;
  provider: 'openai' | 'anthropic' | 'gemini' | 'local' | 'custom';
  display_name: string;
  base_url: string;
  default_model: string;
  has_key: boolean;
  is_active: boolean;
  created_at: string;
};
