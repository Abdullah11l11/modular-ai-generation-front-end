import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  clearKey,
  clearBaseUrl,
  getBaseUrl,
  getKey,
  getProvider,
  getStorageMode,
  getUseProxy,
  setBaseUrl,
  setKey,
  setProvider,
  setStorageMode,
  setUseProxy,
} from '../apiKeys';

describe('apiKeys storage helpers', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('defaults provider to "minimax" and storage mode to "session"', () => {
    expect(getProvider()).toBe('minimax');
    expect(getStorageMode()).toBe('session');
    expect(getUseProxy()).toBe(false);
  });

  it('round-trips a key in sessionStorage and clears from the other storage', () => {
    setKey('minimax', 'sk-test', 'session');
    expect(getKey('minimax')).toBe('sk-test');
    expect(sessionStorage.getItem('mgf.ai.key.minimax')).toBe('sk-test');
    expect(localStorage.getItem('mgf.ai.key.minimax')).toBeNull();

    setKey('minimax', 'sk-test-2', 'local');
    expect(getKey('minimax')).toBe('sk-test-2');
    expect(localStorage.getItem('mgf.ai.key.minimax')).toBe('sk-test-2');
    expect(sessionStorage.getItem('mgf.ai.key.minimax')).toBeNull();
  });

  it('falls back to the other storage if the preferred one is empty', () => {
    localStorage.setItem('mgf.ai.key.minimax', 'sk-from-local');
    expect(getKey('minimax', 'session')).toBe('sk-from-local');
  });

  it('clearKey removes from both storages', () => {
    setKey('minimax', 'sk-x', 'session');
    clearKey('minimax');
    expect(getKey('minimax')).toBeNull();
  });

  it('round-trips base URL and useProxy flag', () => {
    setBaseUrl('minimax', 'https://example.test');
    expect(getBaseUrl('minimax')).toBe('https://example.test');
    clearBaseUrl('minimax');
    expect(getBaseUrl('minimax')).toBeNull();

    setUseProxy(true);
    expect(getUseProxy()).toBe(true);
    setUseProxy(false);
    expect(getUseProxy()).toBe(false);
  });

  it('round-trips the provider selection', () => {
    setProvider('lmstudio');
    expect(getProvider()).toBe('lmstudio');
    setProvider('minimax');
    expect(getProvider()).toBe('minimax');
  });

  it('round-trips the storage mode preference', () => {
    setStorageMode('local');
    expect(getStorageMode()).toBe('local');
    setStorageMode('session');
    expect(getStorageMode()).toBe('session');
  });
});
