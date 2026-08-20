/**
 * Browser-side base-URL storage for the LM Studio provider family.
 *
 * The MiniMax / Anthropic family now stores its base URL on the
 * backend (one row per user in `user_ai_providers`); the browser no
 * longer holds provider API keys or endpoints. LM Studio still
 * talks direct browser-to-LM-Studio, so its base URL is the one
 * thing left that we cache in the browser.
 */

import type { AIProvider } from './AIService';

export const DEFAULT_MINIMAX_BASE_URL = 'https://api.minimax.io/anthropic';
export const DEFAULT_LMSTUDIO_BASE_URL = 'http://localhost:1234';

const BASE_URL_PREFIX = 'mgf.ai.baseUrl.';

const DEFAULT_BY_PROVIDER: Record<AIProvider, string> = {
  minimax: DEFAULT_MINIMAX_BASE_URL,
  lmstudio: DEFAULT_LMSTUDIO_BASE_URL,
};

export const getBaseUrl = (provider: AIProvider): string | null =>
  window.localStorage.getItem(BASE_URL_PREFIX + provider);

export const setBaseUrl = (provider: AIProvider, url: string) => {
  window.localStorage.setItem(BASE_URL_PREFIX + provider, url);
};

export const clearBaseUrl = (provider: AIProvider) => {
  window.localStorage.removeItem(BASE_URL_PREFIX + provider);
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
 * or `http://127.0.0.1:*`. Loopback endpoints don't need a proxy; the
 * browser can call them directly.
 */
export const isLocalBaseUrl = (url: string): boolean =>
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i.test(url);
