import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  clearBaseUrlOverride,
  DEFAULT_MINIMAX_BASE_URL,
  DEFAULT_LMSTUDIO_BASE_URL,
  getEffectiveBaseUrl,
  setBaseUrlOverride,
} from '../baseUrl';
import { clearBaseUrl } from '../apiKeys';

describe('baseUrl helpers', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('returns the MiniMax default when no override is set', () => {
    expect(getEffectiveBaseUrl('minimax')).toBe(DEFAULT_MINIMAX_BASE_URL);
    expect(DEFAULT_MINIMAX_BASE_URL).toMatch(/^https:\/\/api\.minimax\.io\/anthropic$/);
  });

  it('returns the LM Studio default when no override is set', () => {
    expect(getEffectiveBaseUrl('lmstudio')).toBe(DEFAULT_LMSTUDIO_BASE_URL);
    expect(DEFAULT_LMSTUDIO_BASE_URL).toMatch(/^http:\/\/localhost:1234\/v1\/chat\/completions$/);
  });

  it('user override wins over the default for minimax', () => {
    setBaseUrlOverride('minimax', 'https://my-proxy.test/v1');
    expect(getEffectiveBaseUrl('minimax')).toBe('https://my-proxy.test/v1');
  });

  it('user override wins over the default for lmstudio', () => {
    setBaseUrlOverride('lmstudio', 'http://192.168.1.10:1234/v1/chat/completions');
    expect(getEffectiveBaseUrl('lmstudio')).toBe('http://192.168.1.10:1234/v1/chat/completions');
  });

  it('clearBaseUrlOverride falls back to the default', () => {
    setBaseUrlOverride('minimax', 'https://override.test');
    clearBaseUrlOverride('minimax');
    expect(getEffectiveBaseUrl('minimax')).toBe(DEFAULT_MINIMAX_BASE_URL);
  });

  it('clearBaseUrl from apiKeys also clears the override', () => {
    setBaseUrlOverride('lmstudio', 'http://override.test');
    clearBaseUrl('lmstudio');
    expect(getEffectiveBaseUrl('lmstudio')).toBe(DEFAULT_LMSTUDIO_BASE_URL);
  });
});
