/**
 * Smoke test for the seed bundles under docs/superpowers/seed-data/.
 * We can't actually exercise the Laravel seeders from this repo
 * (the backend lives elsewhere), but we can verify the seed files
 * parse cleanly and the JSON / CSS declare the right tokens so the
 * seeder-to-editor round-trip works.
 *
 * The actual content lives under docs/superpowers/seed-data/{arabic,
 * pitch, website, infographic}/. We read it with `fs` so a typo in
 * a seeder file fails the test immediately rather than at the next
 * manual re-seed.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const SEED_ROOT = resolve(process.cwd(), 'docs/superpowers/seed-data');

function readJSON(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf-8')) as Record<string, unknown>;
}

function listSubdirs(parent: string): string[] {
  return readdirSync(parent, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

describe('seed bundles — common shape', () => {
  it('every seed folder ships a top-level README', () => {
    expect(existsSync(resolve(SEED_ROOT, 'README.md'))).toBe(true);
  });

  it('every bundle ships style.css and data.json', () => {
    const topDirs = listSubdirs(SEED_ROOT).filter((d) => d !== 'README.md' && d !== 'README');
    for (const arch of topDirs) {
      const bundles = listSubdirs(resolve(SEED_ROOT, arch));
      for (const b of bundles) {
        const dir = resolve(SEED_ROOT, arch, b);
        expect(existsSync(resolve(dir, 'style.css')), `${arch}/${b}/style.css missing`).toBe(true);
        expect(existsSync(resolve(dir, 'data.json')), `${arch}/${b}/data.json missing`).toBe(true);
      }
    }
  });

  it('every style.css defines the three required tokens', () => {
    const topDirs = listSubdirs(SEED_ROOT).filter((d) => d !== 'README.md' && d !== 'README');
    for (const arch of topDirs) {
      const bundles = listSubdirs(resolve(SEED_ROOT, arch));
      for (const b of bundles) {
        const css = readFileSync(resolve(SEED_ROOT, arch, b, 'style.css'), 'utf-8');
        expect(css, `${arch}/${b}/style.css missing --mgf-color-bg`).toMatch(/--mgf-color-bg:/);
        expect(css, `${arch}/${b}/style.css missing --mgf-color-accent`).toMatch(/--mgf-color-accent:/);
        expect(css, `${arch}/${b}/style.css missing --mgf-color-text-primary`).toMatch(
          /--mgf-color-text-primary:/,
        );
      }
    }
  });

  it('every data.json declares language and direction in _meta', () => {
    const topDirs = listSubdirs(SEED_ROOT).filter((d) => d !== 'README.md' && d !== 'README');
    for (const arch of topDirs) {
      const bundles = listSubdirs(resolve(SEED_ROOT, arch));
      for (const b of bundles) {
        const data = readJSON(resolve(SEED_ROOT, arch, b, 'data.json'));
        const meta = (data._meta ?? {}) as Record<string, unknown>;
        expect(meta.language, `${arch}/${b}: language field missing`).toBeTruthy();
        expect(meta.direction, `${arch}/${b}: direction field missing`).toMatch(/^(ltr|rtl)$/);
      }
    }
  });
});

describe('Arabic seed bundle (Task 4.5)', () => {
  const ARABIC = resolve(SEED_ROOT, 'arabic');
  const ARCHETYPES = ['pitch', 'website', 'summary'] as const;

  it('ships all three archetypes', () => {
    for (const arch of ARCHETYPES) {
      expect(existsSync(resolve(ARABIC, arch)), `${arch}/ directory missing`).toBe(true);
    }
  });

  it('data.json declares language=ar and direction=rtl in _meta', () => {
    for (const arch of ARCHETYPES) {
      const data = readJSON(resolve(ARABIC, arch, 'data.json'));
      const meta = (data._meta ?? {}) as Record<string, unknown>;
      expect(meta.language, `${arch}: language field missing`).toBe('ar');
      expect(meta.direction, `${arch}: direction field missing`).toBe('rtl');
    }
  });

  it('pitch + summary bundles ship at least one slide-NN.html', () => {
    for (const arch of ['pitch', 'summary'] as const) {
      const dir = resolve(ARABIC, arch);
      const slides = readdirSync(dir).filter((f) => /^slide-\d{2}-.+\.html$/.test(f));
      expect(slides.length, `${arch} has no slide files`).toBeGreaterThan(0);
    }
  });

  it('website bundle ships a layout.html (single-page site)', () => {
    const dir = resolve(ARABIC, 'website');
    expect(existsSync(resolve(dir, 'layout.html')), 'website/layout.html missing').toBe(true);
  });

  it('all slide HTML files carry dir="rtl"', () => {
    for (const arch of ARCHETYPES) {
      const dir = resolve(ARABIC, arch);
      const slides = readdirSync(dir).filter((f) => /^slide-\d{2}-.+\.html$/.test(f));
      for (const f of slides) {
        const html = readFileSync(resolve(dir, f), 'utf-8');
        expect(html, `${arch}/${f} missing dir="rtl"`).toContain('dir="rtl"');
      }
    }
  });
});

describe('English pitch variations (Task 5.1)', () => {
  const PITCH = resolve(SEED_ROOT, 'pitch');
  const VARIATIONS = ['fintech-pitch', 'healthtech-pitch', 'climate-pitch', 'consumer-pitch'] as const;

  it('ships all four variations', () => {
    for (const v of VARIATIONS) {
      expect(existsSync(resolve(PITCH, v)), `${v}/ directory missing`).toBe(true);
    }
  });

  it('each variation has a distinct --mgf-color-accent (theme variety)', () => {
    // Lock the four distinct accent colors so the editor's theme
    // switcher has visibly different palettes to demo.
    const expected = {
      'fintech-pitch': '#2f80ff',
      'healthtech-pitch': '#0a7a6b',
      'climate-pitch': '#6ad19c',
      'consumer-pitch': '#d6336c',
    } as const;
    for (const [v, accent] of Object.entries(expected)) {
      const css = readFileSync(resolve(PITCH, v, 'style.css'), 'utf-8');
      expect(css, `${v}/style.css should set --mgf-color-accent to ${accent}`).toMatch(
        new RegExp(`--mgf-color-accent:\\s*${accent.replace('#', '#')}`, 'i'),
      );
    }
  });

  it('each variation data.json declares language=en and direction=ltr', () => {
    for (const v of VARIATIONS) {
      const data = readJSON(resolve(PITCH, v, 'data.json'));
      const meta = (data._meta ?? {}) as Record<string, unknown>;
      expect(meta.language, `${v}: language should be 'en'`).toBe('en');
      expect(meta.direction, `${v}: direction should be 'ltr'`).toBe('ltr');
    }
  });

  it('each variation has a non-empty slide list in data.json', () => {
    for (const v of VARIATIONS) {
      const data = readJSON(resolve(PITCH, v, 'data.json'));
      const slides = (data.slides ?? []) as unknown[];
      expect(slides.length, `${v}: should have at least 4 slides`).toBeGreaterThanOrEqual(4);
    }
  });
});

describe('English website variations (Task 5.2)', () => {
  const WEBSITE = resolve(SEED_ROOT, 'website');
  const VARIATIONS = ['saas-marketing', 'agency-portfolio', 'ecommerce'] as const;

  it('ships all three variations', () => {
    for (const v of VARIATIONS) {
      expect(existsSync(resolve(WEBSITE, v)), `${v}/ directory missing`).toBe(true);
    }
  });

  it('each variation data.json has a top-level "site" object with the required sections', () => {
    for (const v of VARIATIONS) {
      const data = readJSON(resolve(WEBSITE, v, 'data.json'));
      const site = (data.site ?? {}) as Record<string, unknown>;
      expect(site.brand, `${v}: site.brand missing`).toBeTruthy();
      expect(site.nav, `${v}: site.nav missing`).toBeInstanceOf(Array);
      expect(site.hero, `${v}: site.hero missing`).toBeTruthy();
      expect(site.features, `${v}: site.features missing`).toBeTruthy();
      expect(site.testimonial, `${v}: site.testimonial missing`).toBeTruthy();
      expect(site.cta, `${v}: site.cta missing`).toBeTruthy();
      expect(site.footer, `${v}: site.footer missing`).toBeTruthy();
    }
  });

  it('each variation has a distinct --mgf-color-accent (theme variety)', () => {
    const expected = {
      'saas-marketing': '#6366f1',
      'agency-portfolio': '#ff5a1f',
      ecommerce: '#d4a373',
    } as const;
    for (const [v, accent] of Object.entries(expected)) {
      const css = readFileSync(resolve(WEBSITE, v, 'style.css'), 'utf-8');
      expect(css, `${v}/style.css should set --mgf-color-accent to ${accent}`).toMatch(
        new RegExp(`--mgf-color-accent:\\s*${accent.replace('#', '#')}`, 'i'),
      );
    }
  });

  it('each variation data.json declares language=en and direction=ltr', () => {
    for (const v of VARIATIONS) {
      const data = readJSON(resolve(WEBSITE, v, 'data.json'));
      const meta = (data._meta ?? {}) as Record<string, unknown>;
      expect(meta.language, `${v}: language should be 'en'`).toBe('en');
      expect(meta.direction, `${v}: direction should be 'ltr'`).toBe('ltr');
    }
  });
});
