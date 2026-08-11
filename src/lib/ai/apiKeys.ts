import type { AIProvider } from './AIService';

const KEY_PREFIX = 'mgf.ai.key.';
const BASE_URL_PREFIX = 'mgf.ai.baseUrl.';
const STORAGE_MODE_KEY = 'mgf.ai.storageMode';
const USE_PROXY_KEY = 'mgf.ai.useProxy';
const PROVIDER_KEY = 'mgf.ai.provider';

type StorageMode = 'session' | 'local';
/** Renamed from `Storage` to avoid shadowing the DOM `Storage` interface (TS2456). */
type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const pickStorage = (mode: StorageMode): StorageLike =>
  mode === 'local' ? window.localStorage : window.sessionStorage;

const otherStorage = (mode: StorageMode): StorageLike =>
  mode === 'local' ? window.sessionStorage : window.localStorage;

export const getStorageMode = (): StorageMode => {
  const v = window.localStorage.getItem(STORAGE_MODE_KEY);
  return v === 'local' ? 'local' : 'session';
};

export const setStorageMode = (mode: StorageMode) => {
  window.localStorage.setItem(STORAGE_MODE_KEY, mode);
};

export const getProvider = (): AIProvider => {
  const v = window.localStorage.getItem(PROVIDER_KEY);
  return v === 'lmstudio' ? 'lmstudio' : 'minimax';
};

export const setProvider = (provider: AIProvider) => {
  window.localStorage.setItem(PROVIDER_KEY, provider);
};

export const getUseProxy = (): boolean => window.localStorage.getItem(USE_PROXY_KEY) === 'true';

export const setUseProxy = (useProxy: boolean) => {
  window.localStorage.setItem(USE_PROXY_KEY, useProxy ? 'true' : 'false');
};

export const getKey = (
  provider: AIProvider,
  preferred: StorageMode = getStorageMode(),
): string | null => {
  const preferredValue = pickStorage(preferred).getItem(KEY_PREFIX + provider);
  if (preferredValue) return preferredValue;
  return otherStorage(preferred).getItem(KEY_PREFIX + provider);
};

export const setKey = (provider: AIProvider, key: string, mode: StorageMode) => {
  pickStorage(mode).setItem(KEY_PREFIX + provider, key);
  otherStorage(mode).removeItem(KEY_PREFIX + provider);
};

export const clearKey = (provider: AIProvider) => {
  window.sessionStorage.removeItem(KEY_PREFIX + provider);
  window.localStorage.removeItem(KEY_PREFIX + provider);
};

export const getBaseUrl = (provider: AIProvider): string | null =>
  window.localStorage.getItem(BASE_URL_PREFIX + provider);

export const setBaseUrl = (provider: AIProvider, url: string) => {
  window.localStorage.setItem(BASE_URL_PREFIX + provider, url);
};

export const clearBaseUrl = (provider: AIProvider) => {
  window.localStorage.removeItem(BASE_URL_PREFIX + provider);
};
