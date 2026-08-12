/**
 * Smoke test for the Arabic seed bundle. We can't actually exercise
 * the Laravel seeders from this repo (the backend lives elsewhere),
 * but we can verify the seed files parse cleanly and the JSON
 * declares the right direction / locale so the seeder-to-editor
 * round-trip works.
 *
 * The actual content lives under docs/superpowers/seed-data/arabic/.
 * We read it with `fs` so a typo in a seeder file fails the test
 * immediately rather than at the next manual re-seed.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const SEED_ROOT = resolve(
  process.cwd(),
  'docs/superpowers/seed-data/arabic',
);

const ARCHETYPES = ['pitch', 'website', 'summary'] as const;

function readJSON(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf-8')) as Record<string, unknown>;
}

describe('Arabic seed bundle', () => {
  it('ships all three archetypes', () => {
    for (const arch of ARCHETYPES) {
      const dir = resolve(SEED_ROOT, arch);
      expect(existsSync(dir), `${arch}/ directory missing`).toBe(true);
    }
  });

  it('each archetype has a style.css and data.json', () => {
    for (const arch of ARCHETYPES) {
      const dir = resolve(SEED_ROOT, arch);
      expect(existsSync(resolve(dir, 'style.css')), `${arch}/style.css missing`).toBe(true);
      expect(existsSync(resolve(dir, 'data.json')), `${arch}/data.json missing`).toBe(true);
    }
  });

  it('data.json declares language=ar and direction=rtl in _meta', () => {
    for (const arch of ARCHETYPES) {
      const data = readJSON(resolve(SEED_ROOT, arch, 'data.json'));
      const meta = (data._meta ?? {}) as Record<string, unknown>;
      expect(meta.language, `${arch}: language field missing`).toBe('ar');
      expect(meta.direction, `${arch}: direction field missing`).toBe('rtl');
    }
  });

  it('pitch + summary bundles ship at least one slide-NN.html', () => {
    for (const arch of ['pitch', 'summary'] as const) {
      const dir = resolve(SEED_ROOT, arch);
      const slides = readdirSync(dir).filter((f) => /^slide-\d{2}-.+\.html$/.test(f));
      expect(slides.length, `${arch} has no slide files`).toBeGreaterThan(0);
    }
  });

  it('website bundle ships a layout.html (single-page site)', () => {
    const dir = resolve(SEED_ROOT, 'website');
    expect(existsSync(resolve(dir, 'layout.html')), 'website/layout.html missing').toBe(true);
  });

  it('all slide HTML files carry dir="rtl" so editors get the right bidi without rewiring', () => {
    for (const arch of ARCHETYPES) {
      const dir = resolve(SEED_ROOT, arch);
      const slides = readdirSync(dir).filter((f) => /^slide-\d{2}-.+\.html$/.test(f));
      for (const f of slides) {
        const html = readFileSync(resolve(dir, f), 'utf-8');
        expect(html, `${arch}/${f} missing dir="rtl"`).toContain('dir="rtl"');
      }
    }
  });

  it('all style.css files define --mgf-color-bg, --mgf-color-accent, --mgf-color-text-primary', () => {
    // Frontend's BASE_CSS references these three tokens on every
    // page. A missing token would make the seeded project render as
    // an unstyled iframe.
    for (const arch of ARCHETYPES) {
      const css = readFileSync(resolve(SEED_ROOT, arch, 'style.css'), 'utf-8');
      expect(css, `${arch}/style.css missing --mgf-color-bg`).toMatch(/--mgf-color-bg:/);
      expect(css, `${arch}/style.css missing --mgf-color-accent`).toMatch(/--mgf-color-accent:/);
      expect(css, `${arch}/style.css missing --mgf-color-text-primary`).toMatch(
        /--mgf-color-text-primary:/,
      );
    }
  });
});
