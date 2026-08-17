/**
 * MGF → PPTX adapter.
 *
 * Renders an MGF project as a native PowerPoint .pptx using PptxGenJS.
 * Each MGF slide component (`cover`, `problem`, `stats`, etc.) maps to
 * a component-specific renderer that emits pptxgenjs shapes + text
 * using the project's `style.css` tokens as the color/typography
 * palette. Layout fidelity is intentionally approximate — PPTX can't
 * reproduce CSS flex/grid, gradients, or web fonts, so the result
 * looks like a clean slide deck rather than a pixel-perfect copy of
 * the HTML preview.
 *
 * Content source priority:
 *   1. data.json — the structured `slides[].data` payload (rich arrays
 *      like `features[]`, `stats[]`, `plans[]`).
 *   2. slide HTML `data-field` extraction — fallback for projects
 *      that don't have a data.json.
 *
 * Component identification priority:
 *   1. `data.slides[i].component` (from data.json)
 *   2. HTML comment `<!-- Component: <name> -->` at the top of the slide
 *   3. Class-based heuristic (`.mgf-timeline`, `.mgf-comparison`, …)
 *   4. Generic renderer
 */

import PptxGenJS from 'pptxgenjs';
import type { ProjectFile } from '@/types/api';

// 16:9 at PowerPoint's standard 13.33 × 7.5 in.
export const SLIDE_W_IN = 13.333;
export const SLIDE_H_IN = 7.5;

// Padding inside each slide (matches layout.css `.mgf-slide-pad-*`).
const PAD_X = 80 / 96; // 80 px
const PAD_Y = 60 / 96; // 60 px
const ACCENT_BAR_W = 64 / 96;
const ACCENT_BAR_H = 4 / 96;

type Tokens = {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textInverse: string;
  accent: string;
  accentSoft: string;
  accent2: string;
  fontDisplay: string;
  fontBody: string;
  fontMono: string;
  // Slide-level measurements (in inches)
  slideW: number;
  slideH: number;
  padX: number;
  padY: number;
};

const FALLBACK_TOKENS: Tokens = {
  bg: '0B0F17',
  surface: '0F1218',
  surface2: '1A1F2B',
  border: '1E2535',
  borderStrong: '2E3A50',
  textPrimary: 'F4F6FA',
  textSecondary: '94A3B8',
  textInverse: 'FFFFFF',
  accent: '2F80FF',
  accentSoft: '0D1F3C',
  accent2: '00D4AA',
  fontDisplay: 'Calibri',
  fontBody: 'Calibri',
  fontMono: 'Consolas',
  slideW: SLIDE_W_IN,
  slideH: SLIDE_H_IN,
  padX: PAD_X,
  padY: PAD_Y,
};

/**
 * Parse `:root { --mgf-*: ... }` declarations out of the project's
 * style.css. Only top-level :root is read; nested rules are skipped.
 */
export function extractTokens(styleCss: string): Tokens {
  const out: Tokens = { ...FALLBACK_TOKENS };
  const rootMatch = styleCss.match(/:root\s*\{([\s\S]*?)\}/);
  if (!rootMatch) return out;
  const body = rootMatch[1];
  const setVar = (key: keyof Tokens, re: RegExp, transform: (v: string) => string) => {
    const m = body.match(re);
    if (m) (out as Record<string, unknown>)[key] = transform(m[1].trim());
  };
  setVar('bg', /--mgf-color-bg\s*:\s*([^;]+);/, stripHexHash);
  setVar('surface', /--mgf-color-surface\s*:\s*([^;]+);/, stripHexHash);
  setVar('surface2', /--mgf-color-surface-2\s*:\s*([^;]+);/, stripHexHash);
  setVar('border', /--mgf-color-border\s*:\s*([^;]+);/, normalizeColor);
  setVar('borderStrong', /--mgf-color-border-strong\s*:\s*([^;]+);/, normalizeColor);
  setVar('textPrimary', /--mgf-color-text-primary\s*:\s*([^;]+);/, stripHexHash);
  setVar('textSecondary', /--mgf-color-text-secondary\s*:\s*([^;]+);/, stripHexHash);
  setVar('textInverse', /--mgf-color-text-inverse\s*:\s*([^;]+);/, stripHexHash);
  setVar('accent', /--mgf-color-accent\s*:\s*([^;]+);/, stripHexHash);
  setVar('accentSoft', /--mgf-color-accent-soft\s*:\s*([^;]+);/, normalizeColor);
  setVar('accent2', /--mgf-color-accent-2\s*:\s*([^;]+);/, stripHexHash);
  setVar(
    'fontDisplay',
    /--mgf-font-display\s*:\s*([^;]+);/,
    (v) => firstFont(v.replace(/['"]/g, '').split(',')[0] ?? 'Calibri'),
  );
  setVar(
    'fontBody',
    /--mgf-font-body\s*:\s*([^;]+);/,
    (v) => firstFont(v.replace(/['"]/g, '').split(',')[0] ?? 'Calibri'),
  );
  setVar(
    'fontMono',
    /--mgf-font-mono\s*:\s*([^;]+);/,
    (v) => firstFont(v.replace(/['"]/g, '').split(',')[0] ?? 'Consolas'),
  );
  return out;
}

function stripHexHash(v: string): string {
  // PptxGenJS expects 6-char hex without `#`.
  return v.replace(/^#/, '').replace(/^0x/, '').toUpperCase();
}

/**
 * Trivial clamp so non-byte percentages in `rgb()` land at 255 instead
 * of overflowing parseInt (e.g. `rgb(300 0 0)` -> 300 -> `"FF"` padded,
 * which works, but `rgb(150%)` would yield NaN without a guard).
 */
function clampByte(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hex2(n: number): string {
  return clampByte(n).toString(16).padStart(2, '0').toUpperCase();
}

/**
 * Parse an HSL triple into RGB. Standard formula; lightness is
 * pre-decimal so values stay in [0, 1].
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [clampByte((r + m) * 255), clampByte((g + m) * 255), clampByte((b + m) * 255)];
}

/**
 * Map a CSS named color to its 6-digit hex.
 * Returns `null` for unknown names so the caller can fall back to gray.
 */
const NAMED_COLORS: Record<string, string> = {
  black: '000000', white: 'FFFFFF', red: 'FF0000', green: '008000',
  blue: '0000FF', yellow: 'FFFF00', cyan: '00FFFF', magenta: 'FF00FF',
  silver: 'C0C0C0', gray: '808080', grey: '808080', maroon: '800000',
  olive: '808000', lime: '00FF00', aqua: '00FFFF', teal: '008080',
  navy: '000080', fuchsia: 'FF00FF', purple: '800080', orange: 'FFA500',
  pink: 'FFC0CB', brown: 'A52A2A', gold: 'FFD700', indigo: '4B0082',
};

const FALLBACK_HEX = '808080';

/**
 * Resolve any CSS color string to a 6-digit hex that pptxgenjs
 * accepts. Handles `#rgb`/`#rgba`/`#rrggbb`/`#rrggbbaa`, legacy
 * comma `rgb()/rgba()`, the modern space-separated syntax
 * (`rgb(255 255 255 / 8%)`), `hsl()/hsla()`, and named colors.
 *
 * Returns a neutral gray (`808080`) for unresolvable inputs
 * (`var(--x)`, `oklch(...)`, `lab(...)`) so PowerPoint never receives
 * a malformed hex that would trigger a repair prompt.
 *
 * Alpha is intentionally dropped: pptxgenjs's `fill`/`color` options
 * don't accept an alpha channel, so silently using the opaque form is
 * the honest tradeoff. Solid backgrounds with low alpha will render
 * noticeably more saturated than the browser preview — callers that
 * care about this should use a near-opaque value at the source.
 */
export function parseColor(input: string | null | undefined): string {
  if (!input) return FALLBACK_HEX;
  const raw = String(input).trim();
  if (!raw) return FALLBACK_HEX;

  // CSS custom properties are unresolvable from client-side CSS text.
  if (raw.startsWith('var(') || raw.startsWith('--')) return FALLBACK_HEX;

  // Hex shorthand -> full hex.
  if (raw[0] === '#') {
    const hex = raw.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      // #rgb or #rgba — duplicate each character.
      return (hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]).toUpperCase();
    }
    if (hex.length === 6 || hex.length === 8) {
      // Strip alpha for 8-char.
      return (hex.length === 8 ? hex.slice(0, 6) : hex).toUpperCase();
    }
    return FALLBACK_HEX;
  }

  const named = NAMED_COLORS[raw.toLowerCase()];
  if (named) return named;

  // rgb()/rgba() — accept commas or spaces, optional alpha.
  const rgb = raw.match(
    /^rgba?\(\s*([+-]?[\d.]+%?)\s*[,\s]\s*([+-]?[\d.]+%?)\s*[,\s]\s*([+-]?[\d.]+%?)\s*(?:[,/\s]\s*([+-]?[\d.]+%?)\s*)?\)$/i,
  );
  if (rgb) {
    const parseC = (s: string): number => {
      if (s.endsWith('%')) return (parseFloat(s) / 100) * 255;
      return parseFloat(s);
    };
    return (
      hex2(parseC(rgb[1])) +
      hex2(parseC(rgb[2])) +
      hex2(parseC(rgb[3]))
    );
  }

  // hsl()/hsla().
  const hsl = raw.match(
    /^hsla?\(\s*([+-]?[\d.]+)(?:deg)?\s*[,\s]\s*([+-]?[\d.]+)%\s*[,\s]\s*([+-]?[\d.]+)%\s*(?:[,/\s]\s*([+-]?[\d.]+%?)\s*)?\)$/i,
  );
  if (hsl) {
    const h = parseFloat(hsl[1]);
    const s = parseFloat(hsl[2]) / 100;
    const l = parseFloat(hsl[3]) / 100;
    const [r, g, b] = hslToRgb(h, s, l);
    return hex2(r) + hex2(g) + hex2(b);
  }

  // Don't try to parse oklch/lab/color()/named gradients — return gray.
  return FALLBACK_HEX;
}

function normalizeColor(v: string): string {
  // Thin compatibility shim for the two existing call sites
  // (`border`, `accentSoft`) that previously produced a malformed
  // hex for any modern syntax. The real parser lives in `parseColor`.
  return parseColor(v);
}

function firstFont(name: string): string {
  // PptxGenJS expects an installed font name. Generic CSS stacks
  // (system-ui, sans-serif) are stripped.
  const generic = new Set([
    'system-ui',
    'sans-serif',
    'serif',
    'monospace',
    'ui-monospace',
    'ui-sans-serif',
    '-apple-system',
    'BlinkMacSystemFont',
  ]);
  if (generic.has(name.trim())) return 'Calibri';
  return name.trim() || 'Calibri';
}

type SlideData = Record<string, unknown>;

type ParsedDataJson = {
  slides: { id: number; component: string; data: SlideData }[];
};

function parseDataJson(contentJson: string | null): ParsedDataJson | null {
  if (!contentJson) return null;
  try {
    const parsed = JSON.parse(contentJson) as ParsedDataJson | { slides?: unknown };
    if (!parsed || typeof parsed !== 'object' || !('slides' in parsed)) return null;
    const slides = (parsed as ParsedDataJson).slides;
    if (!Array.isArray(slides)) return null;
    return { slides };
  } catch {
    return null;
  }
}

/**
 * Extract `data-field="key"` → text content from an HTML string.
 * Used as a fallback when data.json is absent or out of sync with
 * the slide HTML.
 */
export function extractFieldsFromHtml(html: string): SlideData {
  const out: SlideData = {};
  if (!html.trim()) return out;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('[data-field]').forEach((el) => {
    const key = el.getAttribute('data-field');
    if (!key) return;
    if (!(key in out)) {
      out[key] = (el.textContent ?? '').trim();
    }
  });
  return out;
}

/**
 * Identify the component name from a slide's HTML. Looks at the
 * `<!-- Component: <name> -->` marker first, then class names, then
 * falls back to `generic`.
 */
export function identifyComponent(html: string): string {
  const commentMatch = html.match(/<!--\s*Component:\s*([a-zA-Z0-9-]+)/);
  if (commentMatch) return commentMatch[1].toLowerCase();

  // Order matters: a cover slide (eyebrow + big title + accent bar)
  // also matches the `mgf-title-xl` class, and `closing` would steal
  // the match if it ran first. Cover-specific markers come first; the
  // more generic `closing` and `cover` shapes fall through to the
  // bottom of the list.
  //
  // The regex below span multiple lines with `[\s\S]*?` rather than
  // `.*` because `.` does not match newlines and a pretty-printed
  // slide has them everywhere. Without this, grid/card combos never
  // matched and every multi-line deck classified as `cover`.
  const classMap: [RegExp, string][] = [
    [/mgf-timeline/, 'timeline'],
    [/mgf-comparison/, 'comparison'],
    [/mgf-team-grid/, 'team'],
    [/mgf-quote-mark|mgf-quote-text/, 'quote'],
    [/mgf-card-accent[\s\S]*?mgf-quote-text|mgf-testimonial/, 'testimonial'],
    [/mgf-steps|mgf-step-number/, 'process'],
    [/mgf-faq/, 'faq'],
    [/mgf-pricing|mgf-grid-3[\s\S]*?mgf-card-solid|mgf-price/, 'pricing'],
    [/mgf-stat-group|mgf-grid-3[\s\S]*?mgf-stat-value/, 'stats'],
    [/mgf-grid-3[\s\S]*?mgf-card|mgf-grid-4[\s\S]*?mgf-card|mgf-feature/, 'features'],
    [/mgf-split-left|mgf-split-right|mgf-media/, 'image-text'],
    [/mgf-badge|mgf-announcement/, 'announcement'],
    [/mgf-eyebrow|mgf-title-lg|mgf-title-xl|mgf-accent-bar/, 'cover'],
    [/mgf-flex-center|mgf-text-center[\s\S]*?mgf-cta-solid/, 'closing'],
  ];
  for (const [pattern, name] of classMap) {
    if (pattern.test(html)) return name;
  }
  return 'generic';
}

// ─────────────────────────────────────────────────────────────────────────
// Layout helpers
// ─────────────────────────────────────────────────────────────────────────

type Slide = PptxGenJS.Slide;

function addBackground(slide: Slide, tokens: Tokens): void {
  slide.background = { color: tokens.bg };
}

function addAccentBar(slide: Slide, tokens: Tokens, x: number, y: number): void {
  slide.addShape('rect', {
    x,
    y,
    w: ACCENT_BAR_W,
    h: ACCENT_BAR_H,
    fill: { color: tokens.accent },
    line: { type: 'none' },
  });
}

function addEyebrow(slide: Slide, tokens: Tokens, text: string, x: number, y: number, w: number): void {
  slide.addText(text, {
    x,
    y,
    w,
    h: 0.3,
    fontFace: tokens.fontBody,
    fontSize: 10,
    bold: true,
    color: tokens.accent,
    charSpacing: 4,
    valign: 'middle',
  });
}

function addTitle(
  slide: Slide,
  tokens: Tokens,
  text: string,
  x: number,
  y: number,
  w: number,
  size: 'sm' | 'md' | 'lg' = 'lg',
): void {
  const sizes = { sm: 22, md: 28, lg: 36 };
  slide.addText(text, {
    x,
    y,
    w,
    h: 0.9,
    fontFace: tokens.fontDisplay,
    fontSize: sizes[size],
    bold: true,
    color: tokens.textPrimary,
    valign: 'top',
  });
}

function addSubtitle(slide: Slide, tokens: Tokens, text: string, x: number, y: number, w: number): void {
  slide.addText(text, {
    x,
    y,
    w,
    h: 0.5,
    fontFace: tokens.fontBody,
    fontSize: 14,
    color: tokens.textSecondary,
    valign: 'top',
  });
}

function addBody(slide: Slide, tokens: Tokens, text: string, x: number, y: number, w: number, h: number): void {
  slide.addText(text, {
    x,
    y,
    w,
    h,
    fontFace: tokens.fontBody,
    fontSize: 12,
    color: tokens.textPrimary,
    valign: 'top',
  });
}

function addSlideNumber(slide: Slide, tokens: Tokens, num: string): void {
  slide.addText(num, {
    x: SLIDE_W_IN - PAD_X - 0.5,
    y: SLIDE_H_IN - PAD_Y - 0.25,
    w: 0.5,
    h: 0.25,
    fontFace: tokens.fontMono,
    fontSize: 9,
    color: tokens.textSecondary,
    align: 'right',
    valign: 'middle',
  });
}

function addCard(
  slide: Slide,
  tokens: Tokens,
  x: number,
  y: number,
  w: number,
  h: number,
  variant: 'plain' | 'accent' | 'solid' = 'plain',
): void {
  const fill =
    variant === 'solid'
      ? tokens.accent
      : variant === 'accent'
        ? tokens.surface
        : tokens.surface;
  const line =
    variant === 'solid'
      ? tokens.accent
      : variant === 'accent'
        ? tokens.accent
        : tokens.border;
  slide.addShape('rect', {
    x,
    y,
    w,
    h,
    fill: { color: fill },
    line: { color: line, width: variant === 'accent' ? 0.75 : 1 },
    rectRadius: 0.05,
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Component renderers
// ─────────────────────────────────────────────────────────────────────────

type StatItem = { value?: string; label?: string };
type FeatureItem = { icon?: string; title?: string; desc?: string };
type PlanItem = { name?: string; price?: string; period?: string; features?: string[]; cta?: string };
type MemberItem = { name?: string; role?: string; bio?: string; avatar?: string };

function getString(d: SlideData, key: string, fallback = ''): string {
  const v = d[key];
  return typeof v === 'string' ? v : fallback;
}

function getArray<T extends Record<string, unknown>>(d: SlideData, key: string): T[] {
  const v = d[key];
  if (Array.isArray(v)) return v.filter((x): x is T => typeof x === 'object' && x !== null) as T[];
  return [];
}

/**
 * Return an image source suitable for pptxgenjs `addImage({ data })`,
 * or `null` when nothing usable is present so the caller can fall back
 * to a placeholder.
 *
 * Supported inputs (in order):
 *
 * - A `data:image/...;base64,...` string — passed through verbatim.
 * - A `storage_url` already normalized to an asset layer file; we
 *   expect the orchestrator (`runExport`) to have resolved the URL
 *   to a data URI upstream and stuffed it into `data.image`.
 * - Anything else (raw remote URL we couldn't fetch, missing key,
 *   empty string) — returns `null`.
 *
 * pptxgenjs's `addImage` accepts data URIs, file paths, and HTTP(S)
 * URLs (Node side only), but in our client-side pipeline we always
 * normalize to a data URI so the embed survives into the PPTX ZIP
 * without any extra assets folder work.
 */
function resolveSlideImage(data: SlideData): string | null {
  const raw = data['image'];
  const src = typeof raw === 'string' ? raw.trim() : '';
  if (!src) return null;
  if (src.startsWith('data:')) return src;
  if (/^https?:\/\//i.test(src)) {
    // Remote URL the caller did not pre-resolve — we deliberately do
    // not fetch here because that would block slide rendering on
    // network timing. Callers that want this should normalize ahead.
    return null;
  }
  // Anything else (relative path, opaque id) is not embeddable from
  // a data URI, so signal the placeholder path.
  return null;
}

function renderCover(slide: Slide, data: SlideData, tokens: Tokens, idx: number): void {
  addBackground(slide, tokens);
  const title = getString(data, 'title');
  const subtitle = getString(data, 'subtitle');
  const label = getString(data, 'label');
  const author = getString(data, 'author');
  const date = getString(data, 'date');

  let cy = tokens.padY;
  if (label) {
    addEyebrow(slide, tokens, label.toUpperCase(), tokens.padX, cy, 6);
    cy += 0.35;
    addAccentBar(slide, tokens, tokens.padX, cy);
    cy += 0.25;
  }
  slide.addText(title, {
    x: tokens.padX,
    y: cy,
    w: SLIDE_W_IN - 2 * tokens.padX,
    h: 1.5,
    fontFace: tokens.fontDisplay,
    fontSize: 54,
    bold: true,
    color: tokens.textPrimary,
    valign: 'top',
  });
  cy += 1.6;
  if (subtitle) {
    addSubtitle(slide, tokens, subtitle, tokens.padX, cy, SLIDE_W_IN - 2 * tokens.padX);
    cy += 0.7;
  }
  if (author || date) {
    const meta = [author, date].filter(Boolean).join('  ·  ');
    slide.addText(meta, {
      x: tokens.padX,
      y: cy,
      w: 8,
      h: 0.4,
      fontFace: tokens.fontBody,
      fontSize: 12,
      color: tokens.textSecondary,
      valign: 'top',
    });
  }
  addSlideNumber(slide, tokens, idx > 0 ? String(idx + 1).padStart(2, '0') : '01');
}

function renderProblem(slide: Slide, data: SlideData, tokens: Tokens, idx: number): void {
  addBackground(slide, tokens);
  const title = getString(data, 'title');
  const body = getString(data, 'body');
  const points = getArray<{ value?: string }>(data, 'points').map((p) => p.value ?? '').filter(Boolean);

  let cy = tokens.padY;
  addEyebrow(slide, tokens, 'THE PROBLEM', tokens.padX, cy, 6);
  cy += 0.35;
  addAccentBar(slide, tokens, tokens.padX, cy);
  cy += 0.3;
  addTitle(slide, tokens, title, tokens.padX, cy, SLIDE_W_IN - 2 * tokens.padX);
  cy += 1.0;
  addBody(slide, tokens, body, tokens.padX, cy, SLIDE_W_IN - 2 * tokens.padX, 1.2);
  cy += 1.4;
  // Bulleted list
  if (points.length > 0) {
    const bullets = points.map((p) => ({ text: p, options: { bullet: { code: '25CF' } } }));
    slide.addText(bullets, {
      x: tokens.padX,
      y: cy,
      w: SLIDE_W_IN - 2 * tokens.padX,
      h: 2.5,
      fontFace: tokens.fontBody,
      fontSize: 14,
      color: tokens.textPrimary,
      paraSpaceAfter: 8,
      valign: 'top',
    });
  }
  addSlideNumber(slide, tokens, String(idx + 1).padStart(2, '0'));
}

function renderFeatures(slide: Slide, data: SlideData, tokens: Tokens, idx: number): void {
  addBackground(slide, tokens);
  const title = getString(data, 'title');
  const subtitle = getString(data, 'subtitle');
  const features = getArray<FeatureItem>(data, 'features');

  let cy = tokens.padY;
  addEyebrow(slide, tokens, 'THE SOLUTION', tokens.padX, cy, 6);
  cy += 0.35;
  addAccentBar(slide, tokens, tokens.padX, cy);
  cy += 0.3;
  addTitle(slide, tokens, title, tokens.padX, cy, SLIDE_W_IN - 2 * tokens.padX);
  cy += 1.0;
  if (subtitle) {
    addSubtitle(slide, tokens, subtitle, tokens.padX, cy, SLIDE_W_IN - 2 * tokens.padX);
    cy += 0.6;
  }
  const cardY = cy;
  const cardH = 2.6;
  const gap = 0.25;
  const cardW = (SLIDE_W_IN - 2 * tokens.padX - gap * 2) / 3;
  features.slice(0, 3).forEach((f, i) => {
    const x = tokens.padX + i * (cardW + gap);
    addCard(slide, tokens, x, cardY, cardW, cardH);
    if (f.icon) {
      slide.addText(f.icon, {
        x: x + 0.2,
        y: cardY + 0.15,
        w: 1,
        h: 0.5,
        fontSize: 24,
        valign: 'top',
      });
    }
    slide.addText(f.title ?? '', {
      x: x + 0.2,
      y: cardY + 0.7,
      w: cardW - 0.4,
      h: 0.4,
      fontFace: tokens.fontDisplay,
      fontSize: 14,
      bold: true,
      color: tokens.textPrimary,
      valign: 'top',
    });
    slide.addText(f.desc ?? '', {
      x: x + 0.2,
      y: cardY + 1.1,
      w: cardW - 0.4,
      h: 1.4,
      fontFace: tokens.fontBody,
      fontSize: 11,
      color: tokens.textSecondary,
      valign: 'top',
    });
  });
  addSlideNumber(slide, tokens, String(idx + 1).padStart(2, '0'));
}

function renderStats(slide: Slide, data: SlideData, tokens: Tokens, idx: number): void {
  addBackground(slide, tokens);
  const title = getString(data, 'title');
  const stats = getArray<StatItem>(data, 'stats');
  const caption = getString(data, 'caption');

  let cy = tokens.padY;
  addEyebrow(slide, tokens, 'TRACTION', tokens.padX, cy, 6);
  cy += 0.35;
  addAccentBar(slide, tokens, tokens.padX, cy);
  cy += 0.3;
  addTitle(slide, tokens, title, tokens.padX, cy, SLIDE_W_IN - 2 * tokens.padX);
  cy += 1.0;

  const n = Math.min(stats.length, 4);
  if (n > 0) {
    const cardY = cy;
    const cardH = 2.4;
    const gap = 0.25;
    const cardW = (SLIDE_W_IN - 2 * tokens.padX - gap * (n - 1)) / n;
    stats.slice(0, n).forEach((s, i) => {
      const x = tokens.padX + i * (cardW + gap);
      const isFirst = i === 0 && n === 3;
      addCard(slide, tokens, x, cardY, cardW, cardH, isFirst ? 'solid' : 'accent');
      const valueColor = isFirst ? tokens.textInverse : tokens.accent;
      slide.addText(s.value ?? '', {
        x,
        y: cardY + 0.4,
        w: cardW,
        h: 1.0,
        fontFace: tokens.fontDisplay,
        fontSize: 40,
        bold: true,
        color: valueColor,
        align: 'center',
        valign: 'middle',
      });
      slide.addText((s.label ?? '').toUpperCase(), {
        x,
        y: cardY + 1.4,
        w: cardW,
        h: 0.4,
        fontFace: tokens.fontBody,
        fontSize: 10,
        bold: true,
        color: isFirst ? tokens.textInverse : tokens.textSecondary,
        align: 'center',
        charSpacing: 4,
        valign: 'top',
      });
    });
    cy = cardY + cardH + 0.3;
  }
  if (caption) {
    slide.addText(caption, {
      x: tokens.padX,
      y: cy,
      w: SLIDE_W_IN - 2 * tokens.padX,
      h: 0.3,
      fontFace: tokens.fontBody,
      fontSize: 10,
      italic: true,
      color: tokens.textSecondary,
      align: 'center',
      valign: 'top',
    });
  }
  addSlideNumber(slide, tokens, String(idx + 1).padStart(2, '0'));
}

function renderImageText(slide: Slide, data: SlideData, tokens: Tokens, idx: number): void {
  addBackground(slide, tokens);
  const title = getString(data, 'title');
  const body = getString(data, 'body');
  const layout = getString(data, 'layout');
  // The image source is up to the caller; we accept data URIs (full
  // support), same-origin / asset-layer file references the dialog
  // resolves for us via `resolveSlideImage`, and we keep the existing
  // placeholder for remote URLs so a CORS-blocked fetch never crashes
  // the run.
  const imageSrc = resolveSlideImage(data);

  const splitX = tokens.padX;
  const splitY = tokens.padY;
  const splitW = SLIDE_W_IN - 2 * tokens.padX;
  const splitH = SLIDE_H_IN - 2 * tokens.padY;
  const colW = (splitW - 0.5) / 2;

  const textLeft = !layout.includes('right');
  const textX = textLeft ? splitX : splitX + colW + 0.5;
  const mediaX = textLeft ? splitX + colW + 0.5 : splitX;

  // Text column
  addEyebrow(slide, tokens, 'PRODUCT', textX, splitY, colW);
  addAccentBar(slide, tokens, textX, splitY + 0.35);
  addTitle(slide, tokens, title, textX, splitY + 0.75, colW);
  addBody(slide, tokens, body, textX, splitY + 1.7, colW, 3);

  if (imageSrc) {
    // Slight inset so the image doesn't sit flush against the column
    // border (which would clash with the project's design language).
    slide.addImage({
      data: imageSrc,
      x: mediaX + 0.1,
      y: splitY + 0.1,
      w: colW - 0.2,
      h: splitH - 0.2,
      sizing: { type: 'contain', w: colW - 0.2, h: splitH - 0.2 },
    });
  } else {
    // Media placeholder when no image was supplied (or the URL was
    // remote and CORS-blocked the fetch).
    addCard(slide, tokens, mediaX, splitY, colW, splitH);
    slide.addText('📷  Image placeholder', {
      x: mediaX,
      y: splitY + splitH / 2 - 0.25,
      w: colW,
      h: 0.5,
      fontFace: tokens.fontBody,
      fontSize: 14,
      color: tokens.textSecondary,
      align: 'center',
      valign: 'middle',
    });
  }
  addSlideNumber(slide, tokens, String(idx + 1).padStart(2, '0'));
}

function renderPricing(slide: Slide, data: SlideData, tokens: Tokens, idx: number): void {
  addBackground(slide, tokens);
  const title = getString(data, 'title');
  const plans = getArray<PlanItem>(data, 'plans');

  let cy = tokens.padY;
  addEyebrow(slide, tokens, 'BUSINESS MODEL', tokens.padX, cy, 6);
  cy += 0.35;
  addAccentBar(slide, tokens, tokens.padX, cy);
  cy += 0.3;
  addTitle(slide, tokens, title, tokens.padX, cy, SLIDE_W_IN - 2 * tokens.padX);
  cy += 1.0;

  const cardY = cy;
  const cardH = 3.5;
  const gap = 0.3;
  const cardW = (SLIDE_W_IN - 2 * tokens.padX - gap * 2) / 3;
  plans.slice(0, 3).forEach((p, i) => {
    const x = tokens.padX + i * (cardW + gap);
    const isMiddle = i === 1;
    addCard(slide, tokens, x, cardY, cardW, cardH, isMiddle ? 'solid' : 'plain');

    const labelColor = isMiddle ? tokens.textInverse : tokens.textSecondary;
    const priceColor = isMiddle ? tokens.textInverse : tokens.textPrimary;

    slide.addText((p.name ?? '').toUpperCase(), {
      x: x + 0.25,
      y: cardY + 0.25,
      w: cardW - 0.5,
      h: 0.3,
      fontFace: tokens.fontBody,
      fontSize: 10,
      bold: true,
      color: labelColor,
      charSpacing: 4,
      valign: 'top',
    });
    slide.addText(p.price ?? '', {
      x: x + 0.25,
      y: cardY + 0.6,
      w: cardW - 0.5,
      h: 0.9,
      fontFace: tokens.fontDisplay,
      fontSize: 36,
      bold: true,
      color: priceColor,
      valign: 'top',
    });
    if (p.period) {
      slide.addText(p.period, {
        x: x + 0.25,
        y: cardY + 1.5,
        w: cardW - 0.5,
        h: 0.3,
        fontFace: tokens.fontBody,
        fontSize: 11,
        color: labelColor,
        valign: 'top',
      });
    }
    const features = (p.features ?? []).map((f) => ({ text: f, options: { bullet: { code: '2713' } } }));
    slide.addText(features, {
      x: x + 0.25,
      y: cardY + 1.9,
      w: cardW - 0.5,
      h: 1.2,
      fontFace: tokens.fontBody,
      fontSize: 10,
      color: labelColor,
      paraSpaceAfter: 4,
      valign: 'top',
    });
    if (p.cta) {
      slide.addText(p.cta, {
        x: x + 0.25,
        y: cardY + cardH - 0.5,
        w: cardW - 0.5,
        h: 0.3,
        fontFace: tokens.fontBody,
        fontSize: 11,
        bold: true,
        color: isMiddle ? tokens.accent : tokens.accent,
        valign: 'middle',
      });
    }
  });
  addSlideNumber(slide, tokens, String(idx + 1).padStart(2, '0'));
}

function renderComparison(slide: Slide, data: SlideData, tokens: Tokens, idx: number): void {
  addBackground(slide, tokens);
  const title = getString(data, 'title');
  const leftHeader = getString(data, 'left_header');
  const rightHeader = getString(data, 'right_header');
  const leftItems = getArray<{ value?: string }>(data, 'left_items').map((i) => i.value ?? '').filter(Boolean);
  const rightItems = getArray<{ value?: string }>(data, 'right_items').map((i) => i.value ?? '').filter(Boolean);

  let cy = tokens.padY;
  addEyebrow(slide, tokens, 'COMPETITION', tokens.padX, cy, 6);
  cy += 0.35;
  addAccentBar(slide, tokens, tokens.padX, cy);
  cy += 0.3;
  addTitle(slide, tokens, title, tokens.padX, cy, SLIDE_W_IN - 2 * tokens.padX);
  cy += 1.0;

  const colW = (SLIDE_W_IN - 2 * tokens.padX - 0.4) / 2;
  const colH = SLIDE_H_IN - cy - tokens.padY - 0.4;
  // Left column
  addCard(slide, tokens, tokens.padX, cy, colW, colH);
  slide.addText(leftHeader.toUpperCase(), {
    x: tokens.padX + 0.25,
    y: cy + 0.2,
    w: colW - 0.5,
    h: 0.35,
    fontFace: tokens.fontBody,
    fontSize: 11,
    bold: true,
    color: tokens.textSecondary,
    charSpacing: 4,
    valign: 'top',
  });
  slide.addText(
    leftItems.map((i) => ({ text: i, options: { bullet: { code: '25CF' } } })),
    {
      x: tokens.padX + 0.25,
      y: cy + 0.6,
      w: colW - 0.5,
      h: colH - 0.8,
      fontFace: tokens.fontBody,
      fontSize: 12,
      color: tokens.textPrimary,
      paraSpaceAfter: 6,
      valign: 'top',
    },
  );
  // Right column
  const rightX = tokens.padX + colW + 0.4;
  addCard(slide, tokens, rightX, cy, colW, colH, 'accent');
  slide.addText(rightHeader.toUpperCase(), {
    x: rightX + 0.25,
    y: cy + 0.2,
    w: colW - 0.5,
    h: 0.35,
    fontFace: tokens.fontBody,
    fontSize: 11,
    bold: true,
    color: tokens.accent,
    charSpacing: 4,
    valign: 'top',
  });
  slide.addText(
    rightItems.map((i) => ({ text: i, options: { bullet: { code: '25CF' } } })),
    {
      x: rightX + 0.25,
      y: cy + 0.6,
      w: colW - 0.5,
      h: colH - 0.8,
      fontFace: tokens.fontBody,
      fontSize: 12,
      color: tokens.textPrimary,
      paraSpaceAfter: 6,
      valign: 'top',
    },
  );
  addSlideNumber(slide, tokens, String(idx + 1).padStart(2, '0'));
}

function renderTeam(slide: Slide, data: SlideData, tokens: Tokens, idx: number): void {
  addBackground(slide, tokens);
  const title = getString(data, 'title');
  const members = getArray<MemberItem>(data, 'members');

  let cy = tokens.padY;
  addEyebrow(slide, tokens, 'TEAM', tokens.padX, cy, 6);
  cy += 0.35;
  addAccentBar(slide, tokens, tokens.padX, cy);
  cy += 0.3;
  addTitle(slide, tokens, title, tokens.padX, cy, SLIDE_W_IN - 2 * tokens.padX);
  cy += 1.0;

  const n = Math.min(members.length, 4);
  if (n > 0) {
    const gap = 0.3;
    const colW = (SLIDE_W_IN - 2 * tokens.padX - gap * (n - 1)) / n;
    members.slice(0, n).forEach((m, i) => {
      const x = tokens.padX + i * (colW + gap);
      // Avatar placeholder circle
      slide.addShape('ellipse', {
        x: x + colW / 2 - 0.6,
        y: cy,
        w: 1.2,
        h: 1.2,
        fill: { color: tokens.surface2 },
        line: { color: tokens.border, width: 1 },
      });
      slide.addText('👤', {
        x: x + colW / 2 - 0.6,
        y: cy,
        w: 1.2,
        h: 1.2,
        fontSize: 28,
        color: tokens.textSecondary,
        align: 'center',
        valign: 'middle',
      });
      slide.addText(m.name ?? '', {
        x,
        y: cy + 1.4,
        w: colW,
        h: 0.4,
        fontFace: tokens.fontDisplay,
        fontSize: 14,
        bold: true,
        color: tokens.textPrimary,
        align: 'center',
        valign: 'top',
      });
      slide.addText(m.role ?? '', {
        x,
        y: cy + 1.8,
        w: colW,
        h: 0.3,
        fontFace: tokens.fontBody,
        fontSize: 11,
        color: tokens.accent,
        align: 'center',
        valign: 'top',
      });
      slide.addText(m.bio ?? '', {
        x: x + 0.1,
        y: cy + 2.1,
        w: colW - 0.2,
        h: 1.3,
        fontFace: tokens.fontBody,
        fontSize: 10,
        color: tokens.textSecondary,
        align: 'center',
        valign: 'top',
      });
    });
  }
  addSlideNumber(slide, tokens, String(idx + 1).padStart(2, '0'));
}

function renderClosing(slide: Slide, data: SlideData, tokens: Tokens, idx: number): void {
  addBackground(slide, tokens);
  const title = getString(data, 'title');
  const body = getString(data, 'body');
  const cta = getString(data, 'cta');

  const cx = SLIDE_W_IN / 2;
  const cy = SLIDE_H_IN / 2;

  addEyebrow(slide, tokens, 'THE ASK', cx - 2, cy - 2.0, 4);
  addAccentBar(slide, tokens, cx - ACCENT_BAR_W / 2, cy - 1.55);
  slide.addText(title, {
    x: cx - 4,
    y: cy - 1.2,
    w: 8,
    h: 1.2,
    fontFace: tokens.fontDisplay,
    fontSize: 44,
    bold: true,
    color: tokens.textPrimary,
    align: 'center',
    valign: 'middle',
  });
  if (body) {
    slide.addText(body, {
      x: cx - 4,
      y: cy + 0.1,
      w: 8,
      h: 1.0,
      fontFace: tokens.fontBody,
      fontSize: 16,
      color: tokens.textSecondary,
      align: 'center',
      valign: 'top',
    });
  }
  if (cta) {
    slide.addShape('roundRect', {
      x: cx - 1.5,
      y: cy + 1.4,
      w: 3,
      h: 0.6,
      fill: { color: tokens.accent },
      line: { type: 'none' },
      rectRadius: 0.1,
    });
    slide.addText(cta, {
      x: cx - 1.5,
      y: cy + 1.4,
      w: 3,
      h: 0.6,
      fontFace: tokens.fontBody,
      fontSize: 14,
      bold: true,
      color: tokens.textInverse,
      align: 'center',
      valign: 'middle',
    });
  }
  addSlideNumber(slide, tokens, String(idx + 1).padStart(2, '0'));
}

function renderTimeline(slide: Slide, data: SlideData, tokens: Tokens, idx: number): void {
  addBackground(slide, tokens);
  const title = getString(data, 'title');
  const label = getString(data, 'label');
  const items = getArray<{ date?: string; headline?: string; desc?: string }>(data, 'items');

  let cy = tokens.padY;
  if (label) addEyebrow(slide, tokens, label.toUpperCase(), tokens.padX, cy, 6);
  cy += 0.35;
  addAccentBar(slide, tokens, tokens.padX, cy);
  cy += 0.3;
  addTitle(slide, tokens, title, tokens.padX, cy, SLIDE_W_IN - 2 * tokens.padX);
  cy += 1.0;

  // Cap visible items. The old code computed `(SLIDE_W - pad - 0.3)/N`
  // and assigned every item an `x` based on its index. Past ~12 items
  // the columns slid off the right edge and `colW` went negative
  // past ~38 items — a real crash rather than a visual issue. Show
  // the head of the timeline and a "...continued" marker if there are
  // more.
  const MAX_TIMELINE_ITEMS = 8;
  const visibleItems = items.slice(0, MAX_TIMELINE_ITEMS);
  const overflow = items.length > MAX_TIMELINE_ITEMS ? items.length - MAX_TIMELINE_ITEMS : 0;

  // Slot width based on visible count so the columns always fit.
  const colW = (SLIDE_W_IN - 2 * tokens.padX - 0.3 * (visibleItems.length - 1)) / Math.max(visibleItems.length, 1);
  visibleItems.forEach((it, i) => {
    const x = tokens.padX + i * (colW + 0.3);
    // Dot
    slide.addShape('ellipse', {
      x: x + colW / 2 - 0.08,
      y: cy + 0.05,
      w: 0.16,
      h: 0.16,
      fill: { color: tokens.accent },
      line: { type: 'none' },
    });
    slide.addText(it.date ?? '', {
      x,
      y: cy + 0.3,
      w: colW,
      h: 0.3,
      fontFace: tokens.fontMono,
      fontSize: 11,
      bold: true,
      color: tokens.textSecondary,
      align: 'center',
      valign: 'top',
    });
    slide.addText(it.headline ?? '', {
      x,
      y: cy + 0.7,
      w: colW,
      h: 0.4,
      fontFace: tokens.fontDisplay,
      fontSize: 13,
      bold: true,
      color: tokens.textPrimary,
      align: 'center',
      valign: 'top',
    });
    slide.addText(it.desc ?? '', {
      x: x + 0.1,
      y: cy + 1.2,
      w: colW - 0.2,
      h: 1.6,
      fontFace: tokens.fontBody,
      fontSize: 10,
      color: tokens.textSecondary,
      align: 'center',
      valign: 'top',
    });
  });
  if (overflow > 0) {
    slide.addText(`+${overflow} earlier events not shown`, {
      x: tokens.padX,
      y: SLIDE_H_IN - 0.6,
      w: SLIDE_W_IN - 2 * tokens.padX,
      h: 0.3,
      fontFace: tokens.fontBody,
      fontSize: 9,
      italic: true,
      color: tokens.textSecondary,
      align: 'center',
    });
  }
  addSlideNumber(slide, tokens, String(idx + 1).padStart(2, '0'));
}

function renderQuote(slide: Slide, data: SlideData, tokens: Tokens, idx: number): void {
  addBackground(slide, tokens);
  const quote = getString(data, 'quote');
  const author = getString(data, 'author');
  const title = getString(data, 'title');

  const cx = SLIDE_W_IN / 2;
  const cy = SLIDE_H_IN / 2;
  slide.addText('"', {
    x: cx - 1,
    y: cy - 2.5,
    w: 2,
    h: 1.5,
    fontFace: tokens.fontDisplay,
    fontSize: 96,
    color: tokens.accent,
    align: 'center',
    valign: 'middle',
  });
  slide.addText(quote, {
    x: cx - 4,
    y: cy - 1.2,
    w: 8,
    h: 2.4,
    fontFace: tokens.fontDisplay,
    fontSize: 24,
    italic: true,
    color: tokens.textPrimary,
    align: 'center',
    valign: 'top',
  });
  if (author) {
    slide.addText(author, {
      x: cx - 2,
      y: cy + 1.4,
      w: 4,
      h: 0.4,
      fontFace: tokens.fontDisplay,
      fontSize: 14,
      bold: true,
      color: tokens.textPrimary,
      align: 'center',
      valign: 'top',
    });
  }
  if (title) {
    slide.addText(title, {
      x: cx - 2,
      y: cy + 1.8,
      w: 4,
      h: 0.3,
      fontFace: tokens.fontBody,
      fontSize: 11,
      color: tokens.textSecondary,
      align: 'center',
      valign: 'top',
    });
  }
  addSlideNumber(slide, tokens, String(idx + 1).padStart(2, '0'));
}

function renderTestimonial(slide: Slide, data: SlideData, tokens: Tokens, idx: number): void {
  addBackground(slide, tokens);
  const quote = getString(data, 'quote');
  const author = getString(data, 'author');
  const role = getString(data, 'role');
  const company = getString(data, 'company');

  let cy = tokens.padY;
  addEyebrow(slide, tokens, 'TESTIMONIAL', tokens.padX, cy, 6);
  cy += 0.35;
  addAccentBar(slide, tokens, tokens.padX, cy);
  cy += 0.3;

  // Card
  const cardX = (SLIDE_W_IN - 8.5) / 2;
  const cardY = cy + 0.2;
  const cardW = 8.5;
  const cardH = 4.0;
  addCard(slide, tokens, cardX, cardY, cardW, cardH, 'accent');

  slide.addText(quote, {
    x: cardX + 0.4,
    y: cardY + 0.4,
    w: cardW - 0.8,
    h: 2.0,
    fontFace: tokens.fontDisplay,
    fontSize: 18,
    italic: true,
    color: tokens.textPrimary,
    valign: 'top',
  });
  // Author row
  const authY = cardY + cardH - 1.0;
  slide.addShape('ellipse', {
    x: cardX + 0.4,
    y: authY,
    w: 0.7,
    h: 0.7,
    fill: { color: tokens.surface2 },
    line: { color: tokens.border, width: 1 },
  });
  slide.addText('👤', {
    x: cardX + 0.4,
    y: authY,
    w: 0.7,
    h: 0.7,
    fontSize: 20,
    color: tokens.textSecondary,
    align: 'center',
    valign: 'middle',
  });
  slide.addText(author, {
    x: cardX + 1.3,
    y: authY,
    w: cardW - 1.7,
    h: 0.35,
    fontFace: tokens.fontDisplay,
    fontSize: 13,
    bold: true,
    color: tokens.textPrimary,
    valign: 'top',
  });
  if (role || company) {
    const meta = [role, company].filter(Boolean).join(', ');
    slide.addText(meta, {
      x: cardX + 1.3,
      y: authY + 0.35,
      w: cardW - 1.7,
      h: 0.35,
      fontFace: tokens.fontBody,
      fontSize: 11,
      color: tokens.textSecondary,
      valign: 'top',
    });
  }
  addSlideNumber(slide, tokens, String(idx + 1).padStart(2, '0'));
}

function renderProcess(slide: Slide, data: SlideData, tokens: Tokens, idx: number): void {
  addBackground(slide, tokens);
  const title = getString(data, 'title');
  const steps = getArray<{ num?: string; title?: string; desc?: string }>(data, 'steps');

  let cy = tokens.padY;
  addEyebrow(slide, tokens, 'PROCESS', tokens.padX, cy, 6);
  cy += 0.35;
  addAccentBar(slide, tokens, tokens.padX, cy);
  cy += 0.3;
  addTitle(slide, tokens, title, tokens.padX, cy, SLIDE_W_IN - 2 * tokens.padX);
  cy += 1.0;

  // Vertical budget below `cy`: SLIDE_H_IN - cy - bottom margin.
  // With the eyebrow + accent + title chain above, ~6 in. is the safe
  // cap. The renderer uses a fixed stepH of 0.95" with a 0.15" gap, so
  // 6 steps hit ~6.0"; more would otherwise run off the bottom of the
  // slide. Past that, switch to compact mode (smaller badges, tighter
  // row height) until we fit. Worst case we still cap visibly with a
  // "...continued" footer.
  const BUDGET = SLIDE_H_IN - cy - 0.5;
  const NORMAL_STEP_H = 0.95;
  const NORMAL_GAP = 0.15;
  const COMPACT_STEP_H = 0.62;
  const COMPACT_GAP = 0.08;
  const visibleCount = Math.min(
    steps.length,
    Math.floor((BUDGET + COMPACT_GAP) / (COMPACT_STEP_H + COMPACT_GAP)),
  );
  const visibleSteps = steps.slice(0, visibleCount);
  const overflow = steps.length - visibleSteps.length;
  const usingCompact = visibleSteps.length * (NORMAL_STEP_H + NORMAL_GAP) > BUDGET;
  const stepH = usingCompact ? COMPACT_STEP_H : NORMAL_STEP_H;
  const gap = usingCompact ? COMPACT_GAP : NORMAL_GAP;
  visibleSteps.forEach((s, i) => {
    const y = cy + i * (stepH + gap);
    // Step number badge
    slide.addShape('roundRect', {
      x: tokens.padX,
      y,
      w: 0.7,
      h: 0.7,
      fill: { color: tokens.accent },
      line: { type: 'none' },
      rectRadius: 0.05,
    });
    slide.addText(s.num ?? String(i + 1).padStart(2, '0'), {
      x: tokens.padX,
      y,
      w: 0.7,
      h: 0.7,
      fontFace: tokens.fontDisplay,
      fontSize: 14,
      bold: true,
      color: tokens.textInverse,
      align: 'center',
      valign: 'middle',
    });
    slide.addText(s.title ?? '', {
      x: tokens.padX + 1.0,
      y: y + 0.05,
      w: SLIDE_W_IN - tokens.padX - 1.2,
      h: 0.4,
      fontFace: tokens.fontDisplay,
      fontSize: 16,
      bold: true,
      color: tokens.textPrimary,
      valign: 'top',
    });
    slide.addText(s.desc ?? '', {
      x: tokens.padX + 1.0,
      y: y + 0.45,
      w: SLIDE_W_IN - tokens.padX - 1.2,
      h: 0.5,
      fontFace: tokens.fontBody,
      fontSize: 11,
      color: tokens.textSecondary,
      valign: 'top',
    });
  });
  if (overflow > 0) {
    slide.addText(`+${overflow} more steps not shown`, {
      x: tokens.padX,
      y: SLIDE_H_IN - 0.6,
      w: SLIDE_W_IN - 2 * tokens.padX,
      h: 0.3,
      fontFace: tokens.fontBody,
      fontSize: 9,
      italic: true,
      color: tokens.textSecondary,
      align: 'center',
    });
  }
  addSlideNumber(slide, tokens, String(idx + 1).padStart(2, '0'));
}

function renderFaq(slide: Slide, data: SlideData, tokens: Tokens, idx: number): void {
  addBackground(slide, tokens);
  const title = getString(data, 'title');
  const items = getArray<{ q?: string; a?: string }>(data, 'items');

  let cy = tokens.padY;
  addEyebrow(slide, tokens, 'FAQ', tokens.padX, cy, 6);
  cy += 0.35;
  addAccentBar(slide, tokens, tokens.padX, cy);
  cy += 0.3;
  addTitle(slide, tokens, title, tokens.padX, cy, SLIDE_W_IN - 2 * tokens.padX);
  cy += 1.0;

  // The old code placed each item at `cy + i * 1.05`, regardless of
  // remaining vertical space. Six items fit; seven don't. Cap the
  // visible count using a tight row budget so the footer (slide
  // number) never collides with the last answer.
  const ROW = 1.05;
  const BUDGET = SLIDE_H_IN - cy - 0.5;
  const maxVisible = Math.max(1, Math.floor((BUDGET + 0.15) / ROW));
  const visibleItems = items.slice(0, maxVisible);
  const overflow = items.length - visibleItems.length;
  visibleItems.forEach((it, i) => {
    const y = cy + i * ROW;
    slide.addText(it.q ?? '', {
      x: tokens.padX,
      y,
      w: SLIDE_W_IN - 2 * tokens.padX,
      h: 0.4,
      fontFace: tokens.fontDisplay,
      fontSize: 14,
      bold: true,
      color: tokens.textPrimary,
      valign: 'top',
    });
    slide.addText(it.a ?? '', {
      x: tokens.padX,
      y: y + 0.4,
      w: SLIDE_W_IN - 2 * tokens.padX,
      h: 0.5,
      fontFace: tokens.fontBody,
      fontSize: 11,
      color: tokens.textSecondary,
      valign: 'top',
    });
    // Divider line
    slide.addShape('line', {
      x: tokens.padX,
      y: y + 0.95,
      w: SLIDE_W_IN - 2 * tokens.padX,
      h: 0,
      line: { color: tokens.border, width: 0.75 },
    });
  });
  if (overflow > 0) {
    slide.addText(`+${overflow} more questions not shown`, {
      x: tokens.padX,
      y: SLIDE_H_IN - 0.6,
      w: SLIDE_W_IN - 2 * tokens.padX,
      h: 0.3,
      fontFace: tokens.fontBody,
      fontSize: 9,
      italic: true,
      color: tokens.textSecondary,
      align: 'center',
    });
  }
  addSlideNumber(slide, tokens, String(idx + 1).padStart(2, '0'));
}

function renderAnnouncement(slide: Slide, data: SlideData, tokens: Tokens, idx: number): void {
  addBackground(slide, tokens);
  const badge = getString(data, 'badge');
  const title = getString(data, 'title');
  const body = getString(data, 'body');
  const cta = getString(data, 'cta');

  const cx = SLIDE_W_IN / 2;
  const cy = SLIDE_H_IN / 2;
  if (badge) {
    slide.addShape('roundRect', {
      x: cx - 1,
      y: cy - 2.0,
      w: 2,
      h: 0.5,
      fill: { color: tokens.accent },
      line: { type: 'none' },
      rectRadius: 0.25,
    });
    slide.addText(badge.toUpperCase(), {
      x: cx - 1,
      y: cy - 2.0,
      w: 2,
      h: 0.5,
      fontFace: tokens.fontBody,
      fontSize: 12,
      bold: true,
      color: tokens.textInverse,
      align: 'center',
      valign: 'middle',
    });
  }
  slide.addText(title, {
    x: cx - 4,
    y: cy - 1.2,
    w: 8,
    h: 1.2,
    fontFace: tokens.fontDisplay,
    fontSize: 32,
    bold: true,
    color: tokens.textPrimary,
    align: 'center',
    valign: 'middle',
  });
  if (body) {
    slide.addText(body, {
      x: cx - 4,
      y: cy + 0.1,
      w: 8,
      h: 1.4,
      fontFace: tokens.fontBody,
      fontSize: 14,
      color: tokens.textSecondary,
      align: 'center',
      valign: 'top',
    });
  }
  if (cta) {
    slide.addShape('roundRect', {
      x: cx - 1.5,
      y: cy + 1.7,
      w: 3,
      h: 0.6,
      fill: { color: tokens.accent },
      line: { type: 'none' },
      rectRadius: 0.1,
    });
    slide.addText(cta, {
      x: cx - 1.5,
      y: cy + 1.7,
      w: 3,
      h: 0.6,
      fontFace: tokens.fontBody,
      fontSize: 14,
      bold: true,
      color: tokens.textInverse,
      align: 'center',
      valign: 'middle',
    });
  }
  addSlideNumber(slide, tokens, String(idx + 1).padStart(2, '0'));
}

function renderGeneric(slide: Slide, data: SlideData, tokens: Tokens, idx: number, html: string): void {
  addBackground(slide, tokens);
  // Try to render anything that looks like title + body content.
  const fields = extractFieldsFromHtml(html);
  const title = getString(data, 'title') || getString(fields, 'title');
  const body = getString(data, 'body') || getString(fields, 'body');
  if (title) addTitle(slide, tokens, title, tokens.padX, tokens.padY, SLIDE_W_IN - 2 * tokens.padX);
  if (body) addBody(slide, tokens, body, tokens.padX, tokens.padY + 1.0, SLIDE_W_IN - 2 * tokens.padX, 4);
  addSlideNumber(slide, tokens, String(idx + 1).padStart(2, '0'));
}

const COMPONENT_RENDERERS: Record<string, (slide: Slide, data: SlideData, tokens: Tokens, idx: number, html: string) => void> = {
  cover: (s, d, t, i) => renderCover(s, d, t, i),
  problem: (s, d, t, i) => renderProblem(s, d, t, i),
  features: (s, d, t, i) => renderFeatures(s, d, t, i),
  stats: (s, d, t, i) => renderStats(s, d, t, i),
  'image-text': (s, d, t, i) => renderImageText(s, d, t, i),
  pricing: (s, d, t, i) => renderPricing(s, d, t, i),
  comparison: (s, d, t, i) => renderComparison(s, d, t, i),
  team: (s, d, t, i) => renderTeam(s, d, t, i),
  closing: (s, d, t, i) => renderClosing(s, d, t, i),
  timeline: (s, d, t, i) => renderTimeline(s, d, t, i),
  quote: (s, d, t, i) => renderQuote(s, d, t, i),
  testimonial: (s, d, t, i) => renderTestimonial(s, d, t, i),
  process: (s, d, t, i) => renderProcess(s, d, t, i),
  faq: (s, d, t, i) => renderFaq(s, d, t, i),
  announcement: (s, d, t, i) => renderAnnouncement(s, d, t, i),
  generic: (s, d, t, i, h) => renderGeneric(s, d, t, i, h),
};

// ─────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────

export type BuildPptxOptions = {
  files: ProjectFile[];
  projectName: string;
  /**
   * RTL/Arabic projects flip text alignment and set `rtlMode` so
   * PowerPoint renders them right-to-left. Default LTR.
   */
  direction?: 'ltr' | 'rtl';
};

function findFile(files: ProjectFile[], layer: string, name: string): ProjectFile | undefined {
  return files.find((f) => f.layer === layer && f.name === name);
}

/**
 * Look up a renderer safely. Two failure modes the old code had:
 *
 * 1. `COMPONENT_RENDERERS['constructor']` returned the inherited
 *    `Object.prototype.constructor` (a function), which then called
 *    with five args… unexpected behavior rather than a clean fallback.
 *    Guard via `hasOwnProperty`.
 * 2. `data.json` emits `component: "ImageText"` / `"PRICING"`. The
 *    lookup was case-sensitive and missed every mixed-case key. Lower
 *    + dash-normalize before lookup so mixed-case prompts still work.
 */
function findRenderer(component: string): (slide: Slide, data: SlideData, tokens: Tokens, idx: number, html: string) => void {
  const key = component.toLowerCase().replace(/_/g, '-');
  if (Object.prototype.hasOwnProperty.call(COMPONENT_RENDERERS, key)) {
    return COMPONENT_RENDERERS[key];
  }
  return COMPONENT_RENDERERS.generic;
}

/**
 * Build a .pptx file from the project's MGF file set. Returns a
 * `Uint8Array` containing the PPTX bytes (a ZIP archive — same store
 * format our `lib/zip.ts` would produce).
 */
export async function buildPptxPresentation({
  files,
  projectName,
  direction = 'ltr',
}: BuildPptxOptions): Promise<Uint8Array> {
  const styleCss = findFile(files, 'style', 'style.css')?.content ?? '';
  const tokens = extractTokens(styleCss);
  const contentJson =
    findFile(files, 'content', 'data.json')?.content ??
    findFile(files, 'content', 'content.json')?.content ??
    null;
  const dataJson = parseDataJson(contentJson);

  // Collect slides from data.json + slide files (matched by id).
  const slideFiles = files
    .filter((f) => f.layer === 'slide' && f.content != null)
    .sort((a, b) => a.sort_order - b.sort_order);

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = projectName;
  pptx.company = 'MGF';
  pptx.author = 'MGF Editor';
  // Set once on the presentation so every shape inherits RTL behavior.
  // pptxgenjs also per-shape honors `rtlMode` and `align`, which
  // renderers below set explicitly for user-visible text boxes.
  pptx.rtlMode = direction === 'rtl';

  for (let i = 0; i < slideFiles.length; i++) {
    const file = slideFiles[i];
    const html = file.content ?? '';
    const fromJson = dataJson?.slides.find((s, n) => {
      if (typeof s.id === 'number' && typeof file.name === 'string') {
        // Match by index in the file list as a fallback. data.json's
        // `id` is the slide position (1-indexed).
        const m = file.name.match(/slide-(\d+)/);
        if (m) return parseInt(m[1], 10) === s.id;
      }
      return n === i;
    });
    const component = fromJson?.component ?? identifyComponent(html);
    const data = fromJson?.data ?? extractFieldsFromHtml(html);

    const slide = pptx.addSlide();
    try {
      const renderer = findRenderer(component);
      renderer(slide, data, tokens, i, html);
    } catch (err) {
      // One bad slide must never abort the whole export. Surface a
      // placeholder slide with the failure cause so the user can still
      // get a valid PPTX for every other slide.
      console.warn(`[mgfPptx] slide ${i + 1} (${component}) failed:`, err);
      addBackground(slide, tokens);
      slide.addText(
        `[Slide ${i + 1} could not be rendered — ${String(err instanceof Error ? err.message : err)}]`,
        {
          x: tokens.padX,
          y: SLIDE_H_IN / 2 - 0.5,
          w: SLIDE_W_IN - 2 * tokens.padX,
          h: 1,
          fontFace: tokens.fontBody,
          fontSize: 14,
          color: tokens.textSecondary,
          align: direction === 'rtl' ? 'right' : 'left',
        },
      );
    }
  }

  // If no slide files exist, emit at least one slide so PowerPoint
  // doesn't reject the file.
  if (slideFiles.length === 0) {
    const slide = pptx.addSlide();
    addBackground(slide, tokens);
    slide.addText(projectName, {
      x: 1,
      y: SLIDE_H_IN / 2 - 0.5,
      w: SLIDE_W_IN - 2,
      h: 1,
      fontFace: tokens.fontDisplay,
      fontSize: 36,
      bold: true,
      color: tokens.textPrimary,
      align: 'center',
    });
  }

  // pptxgenjs `write('arraybuffer')` returns ArrayBuffer in the
  // browser; cast to Uint8Array for our downloadBytes helper.
  const buf = await pptx.write({ outputType: 'arraybuffer' });
  return new Uint8Array(buf as ArrayBuffer);
}
