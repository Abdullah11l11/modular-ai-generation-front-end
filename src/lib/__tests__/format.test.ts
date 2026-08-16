import { describe, expect, it } from 'vitest';
import { formatBytes, formatNumber, formatRelativeTime } from '../format';

describe('formatBytes', () => {
  it('returns "0 B" for null, undefined, or 0', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(null)).toBe('0 B');
    expect(formatBytes(undefined)).toBe('0 B');
  });
  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 GB');
  });
});

describe('formatNumber', () => {
  it('returns small numbers as-is', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(999)).toBe('999');
  });
  it('uses k-suffix for thousands, dropping trailing .0', () => {
    expect(formatNumber(1_000)).toBe('1k');
    expect(formatNumber(1_234)).toBe('1.2k');
    expect(formatNumber(12_345)).toBe('12k');
    expect(formatNumber(999_999)).toBe('1000k');
  });
  it('uses M-suffix for millions, dropping trailing .0', () => {
    expect(formatNumber(1_000_000)).toBe('1M');
    expect(formatNumber(2_500_000)).toBe('2.5M');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-08-16T12:00:00Z');
  it('returns "just now" for <60s', () => {
    expect(formatRelativeTime('2026-08-16T11:59:30Z', now)).toBe('just now');
  });
  it('returns minutes for <60m', () => {
    expect(formatRelativeTime('2026-08-16T11:55:00Z', now)).toBe('5m ago');
    expect(formatRelativeTime('2026-08-16T11:01:00Z', now)).toBe('59m ago');
  });
  it('flips to hours at the 60-minute boundary', () => {
    expect(formatRelativeTime('2026-08-16T11:00:00Z', now)).toBe('1h ago');
    expect(formatRelativeTime('2026-08-16T09:00:00Z', now)).toBe('3h ago');
  });
  it('returns days for <7d', () => {
    expect(formatRelativeTime('2026-08-14T12:00:00Z', now)).toBe('2d ago');
  });
  it('returns weeks for <30d', () => {
    expect(formatRelativeTime('2026-08-02T12:00:00Z', now)).toBe('2w ago');
  });
  it('falls back to ISO date for >=30d', () => {
    expect(formatRelativeTime('2026-01-16T12:00:00Z', now)).toBe('2026-01-16');
  });
});
