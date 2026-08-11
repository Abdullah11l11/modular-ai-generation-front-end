import type { AIProvider } from './AIService';
import { clearBaseUrl, getBaseUrl, setBaseUrl } from './apiKeys';

export const DEFAULT_MINIMAX_BASE_URL = 'https://api.minimax.io/anthropic';
export const DEFAULT_LMSTUDIO_BASE_URL = 'http://localhost:1234';

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

/**
 * True when the URL points at a loopback address — `http://localhost:*`
 * or `http://127.0.0.1:*`. Loopback endpoints don't need the serverless
 * proxy; the browser can call them directly.
 */
export const isLocalBaseUrl = (url: string): boolean =>
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i.test(url);
