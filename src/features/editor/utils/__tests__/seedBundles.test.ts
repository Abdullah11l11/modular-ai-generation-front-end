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

describe('English infographic variations (Task 5.3)', () => {
  const INFO = resolve(SEED_ROOT, 'infographic');
  const VARIATIONS = ['annual-report', 'product-explainer'] as const;

  it('ships both variations', () => {
    for (const v of VARIATIONS) {
      expect(existsSync(resolve(INFO, v)), `${v}/ directory missing`).toBe(true);
    }
  });

  it('each variation has a non-empty slide list (>= 5 slides)', () => {
    for (const v of VARIATIONS) {
      const data = readJSON(resolve(INFO, v, 'data.json'));
      const slides = (data.slides ?? []) as unknown[];
      expect(slides.length, `${v}: should have at least 5 slides`).toBeGreaterThanOrEqual(5);
    }
  });

  it('each variation has a distinct --mgf-color-accent (theme variety)', () => {
    // Locked accents so the two infographics read as visibly different
    // visual systems: warm/editorial vs cold/technical.
    const expected = {
      'annual-report': '#b46a3a',
      'product-explainer': '#38bdf8',
    } as const;
    for (const [v, accent] of Object.entries(expected)) {
      const css = readFileSync(resolve(INFO, v, 'style.css'), 'utf-8');
      expect(css, `${v}/style.css should set --mgf-color-accent to ${accent}`).toMatch(
        new RegExp(`--mgf-color-accent:\\s*${accent.replace('#', '#')}`, 'i'),
      );
    }
  });

  it('each variation data.json declares language=en and direction=ltr', () => {
    for (const v of VARIATIONS) {
      const data = readJSON(resolve(INFO, v, 'data.json'));
      const meta = (data._meta ?? {}) as Record<string, unknown>;
      expect(meta.language, `${v}: language should be 'en'`).toBe('en');
      expect(meta.direction, `${v}: direction should be 'ltr'`).toBe('ltr');
    }
  });

  it('each variation data.json carries _meta.output_target = "infographic-deck"', () => {
    for (const v of VARIATIONS) {
      const data = readJSON(resolve(INFO, v, 'data.json'));
      const meta = (data._meta ?? {}) as Record<string, unknown>;
      expect(meta.output_target, `${v}: _meta.output_target should be 'infographic-deck'`).toBe(
        'infographic-deck',
      );
    }
  });
});

describe('cross-archetype theme variety (Task 5.4)', () => {
  // The seed catalog needs to actually exercise the editor's theme
  // system: at minimum 4 distinct token palettes, with a healthy
  // mix of light/dark backgrounds, a spread of accent hues, and
  // font tokens across the board so the Style tab has real variety
  // to switch between.

  function allBundles(): Array<{ arch: string; name: string }> {
    const result: Array<{ arch: string; name: string }> = [];
    const topDirs = listSubdirs(SEED_ROOT).filter((d) => d !== 'README.md' && d !== 'README');
    for (const arch of topDirs) {
      const bundles = listSubdirs(resolve(SEED_ROOT, arch));
      for (const b of bundles) {
        result.push({ arch, name: b });
      }
    }
    return result;
  }

  it('ships at least 4 distinct --mgf-color-accent values across the catalog', () => {
    const bundles = allBundles();
    const accents = new Set<string>();
    for (const { arch, name } of bundles) {
      const css = readFileSync(resolve(SEED_ROOT, arch, name, 'style.css'), 'utf-8');
      const m = css.match(/--mgf-color-accent:\s*([#a-fA-F0-9]+);/);
      expect(m, `${arch}/${name}: --mgf-color-accent not found`).toBeTruthy();
      if (m) accents.add(m[1].toLowerCase());
    }
    expect(accents.size, `expected >= 4 distinct accent hues, got ${accents.size}`).toBeGreaterThanOrEqual(4);
  });

  it('has at least 3 light-bg and 3 dark-bg bundles', () => {
    const bundles = allBundles();
    let light = 0;
    let dark = 0;
    for (const { arch, name } of bundles) {
      const css = readFileSync(resolve(SEED_ROOT, arch, name, 'style.css'), 'utf-8');
      const m = css.match(/--mgf-color-bg:\s*(#[a-fA-F0-9]+);/);
      if (!m) continue;
      const hex = m[1].slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      if (luminance > 0.6) light++;
      else if (luminance < 0.25) dark++;
    }
    expect(light, `expected >= 3 light-bg bundles, got ${light}`).toBeGreaterThanOrEqual(3);
    expect(dark, `expected >= 3 dark-bg bundles, got ${dark}`).toBeGreaterThanOrEqual(3);
  });

  it('every bundle declares both --mgf-font-display and --mgf-font-body', () => {
    const bundles = allBundles();
    for (const { arch, name } of bundles) {
      const css = readFileSync(resolve(SEED_ROOT, arch, name, 'style.css'), 'utf-8');
      expect(
        css,
        `${arch}/${name}/style.css missing --mgf-font-display`,
      ).toMatch(/--mgf-font-display:/);
      expect(
        css,
        `${arch}/${name}/style.css missing --mgf-font-body`,
      ).toMatch(/--mgf-font-body:/);
    }
  });

  it('catalog exposes at least 4 distinct font families', () => {
    // Locks that the 4 token palettes include visibly different
    // typography pairings (sans + serif + mono + Arabic).
    const bundles = allBundles();
    const families = new Set<string>();
    for (const { arch, name } of bundles) {
      const css = readFileSync(resolve(SEED_ROOT, arch, name, 'style.css'), 'utf-8');
      const m = css.match(/--mgf-font-display:\s*([^;]+);/);
      if (m) {
        // Take the first family name (before the comma).
        const first = m[1].split(',')[0].trim().replace(/^['"]|['"]$/g, '');
        if (first) families.add(first);
      }
    }
    expect(
      families.size,
      `expected >= 4 distinct display-font families, got ${families.size}: ${[...families].join(', ')}`,
    ).toBeGreaterThanOrEqual(4);
  });

  it('locks the 4 designated token palettes (one per archetype family)', () => {
    // These are the "flagship" palettes — one per archetype family.
    // The catalog has more variations under each, but these four
    // guarantee a visibly different demo at the theme-switcher level.
    const expected = {
      'pitch/fintech-pitch': '#2f80ff',
      'website/saas-marketing': '#6366f1',
      'infographic/annual-report': '#b46a3a',
      'arabic/pitch': '#22d3ee',
    } as const;
    for (const [path, accent] of Object.entries(expected)) {
      const [arch, name] = path.split('/');
      const css = readFileSync(resolve(SEED_ROOT, arch, name, 'style.css'), 'utf-8');
      expect(css, `${path} should set --mgf-color-accent to ${accent}`).toMatch(
        new RegExp(`--mgf-color-accent:\\s*${accent.replace('#', '#')}`, 'i'),
      );
    }
  });
});
