import type { AIProvider } from './AIService';
import { clearBaseUrl, getBaseUrl, setBaseUrl } from './apiKeys';

export const DEFAULT_MINIMAX_BASE_URL = 'https://api.minimax.io/anthropic';
export const DEFAULT_LMSTUDIO_BASE_URL = 'http://localhost:1234/v1/chat/completions';

const DEFAULT_BY_PROVIDER: Record<AIProvider, string> = {
  minimax: DEFAULT_MINIMAX_BASE_URL,
  lmstudio: DEFAULT_LMSTUDIO_BASE_URL,
};

export const getEffectiveBaseUrl = (provider: AIProvider): string =>
  getBaseUrl(provider) ?? DEFAULT_BY_PROVIDER[provider];

export const setBaseUrlOverride = (provider: AIProvider, url: string) => {
  setBaseUrl(provider, url);
};

export const clearBaseUrlOverride = (provider: AIProvider) => {
  clearBaseUrl(provider);
};
