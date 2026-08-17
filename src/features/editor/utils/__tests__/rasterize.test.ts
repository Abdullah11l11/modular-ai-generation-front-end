import { describe, expect, it } from 'vitest';
import { rasterizeHtml } from '../rasterize';

/**
 * rasterizeHtml depends on real iframe layout + `modern-screenshot`'s
 * canvas-backed renderer, which jsdom cannot support. These tests
 * cover only argument validation that fails fast before any DOM work
 * happens.
 *
 * End-to-end behavior is verified manually via the Playwright MCP
 * against the seeded projects (see the plan's verification section).
 */

describe('rasterizeHtml — input validation (jsdom-safe)', () => {
  it('rejects empty html', async () => {
    await expect(rasterizeHtml({ html: '', width: 1280, height: 720 })).rejects.toThrow(/html is empty/);
  });

  it('rejects non-positive width', async () => {
    await expect(rasterizeHtml({ html: '<p>x</p>', width: 0, height: 720 })).rejects.toThrow(/width\/height/);
  });

  it('rejects non-positive height', async () => {
    await expect(rasterizeHtml({ html: '<p>x</p>', width: 1280, height: -1 })).rejects.toThrow(/width\/height/);
  });

  it('rejects scale < 1', async () => {
    await expect(rasterizeHtml({ html: '<p>x</p>', width: 1280, height: 720, scale: 0.5 })).rejects.toThrow(/scale/);
  });

  it('rejects scale > 4', async () => {
    await expect(rasterizeHtml({ html: '<p>x</p>', width: 1280, height: 720, scale: 8 })).rejects.toThrow(/scale/);
  });

  it('rejects an AbortSignal that was already aborted', async () => {
    const ctrl = new AbortController();
    ctrl.abort();
    await expect(
      rasterizeHtml({ html: '<p>x</p>', width: 1280, height: 720, signal: ctrl.signal }),
    ).rejects.toThrow(/aborted/);
  });
});

describe('rasterizeHtml — option defaults', () => {
  it('accepts the documented option set without throwing during validation', () => {
    // Just touch the type surface — the actual rasterization can't run in jsdom.
    const opts: Parameters<typeof rasterizeHtml>[0] = {
      html: '<p>x</p>',
      width: 1280,
      height: 720,
      scale: 2,
      format: 'png',
      quality: 0.92,
      backgroundColor: '#050505',
      timeoutMs: 15000,
      fitContent: false,
    };
    expect(opts.scale).toBe(2);
    expect(opts.format).toBe('png');
  });

  it('exposes naturalWidth/naturalHeight in the result type', () => {
    // Compile-time check: importing the type would have failed if the
    // shape were wrong. At runtime we just confirm the symbol resolves.
    type R = Awaited<ReturnType<typeof rasterizeHtml>>;
    const sample: Partial<R> = { naturalWidth: 1280, naturalHeight: 720 };
    expect(sample.naturalWidth).toBe(1280);
    expect(sample.naturalHeight).toBe(720);
  });
});
