/**
 * Style probe — read computed CSS from a rendered slide.
 *
 * Each archetype renderer (`renderCover`, `renderStats`, etc.) historically
 * hard-codes visual properties from a `tokens` object: `rectRadius: 0.05`,
 * `fill: tokens.surface`, `border: tokens.border`. That keeps the output
 * predictable but ignores the project's actual design — every card looks
 * identical regardless of whether the editor used `mgf-card-accent`,
 * `mgf-card-neo`, `mgf-card-glass`, or a custom border-radius.
 *
 * `StyleProbe` lets a renderer pull the live computed style for any
 * CSS selector inside the rendered slide. The renderer can then
 * override its hard-coded defaults with the values the user actually
 * configured.
 *
 * The probe is created once per slide (inside an iframe that loads
 * the assembled slide HTML, the same machinery `slideDomWalker.ts`
 * already uses for measurement) and torn down when the slide's
 * renderers finish.
 *
 * All units are normalized:
 *   - Colors are 6-digit hex strings (no `#`), same as PptxGenJS expects.
 *   - Border-radius is in CSS pixels (callers convert to inches via
 *     `px / 96`).
 *   - Border-width is in points (PptxGenJS's native unit).
 *   - Box-shadow is parsed into `{ offsetX, offsetY, blur, hex }`
 *     where offsets are in CSS px and `hex` is the shadow color. The
 *     `box-shadow` CSS property has many forms; this module only
 *     handles the common offset+blur+color case that the MGF design
 *     system actually uses (hard offset for neo-brutal cards, soft
 *     drop for hover states).
 */

// ─────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────

export type ComputedStyle = {
  /** Top-left border radius in CSS pixels. */
  borderTopLeftRadiusPx: number;
  /** Background color as 6-digit hex (no `#`). Empty string = transparent. */
  backgroundColor: string;
  /** Top border color as 6-digit hex. Empty string = transparent. */
  borderColor: string;
  /** Top border width in points. */
  borderWidthPt: number;
  /** Parsed box-shadow, or null if there isn't one. */
  boxShadow: ParsedBoxShadow | null;
  /** Foreground (text) color as 6-digit hex. */
  color: string;
};

export type ParsedBoxShadow = {
  /** Horizontal offset in CSS px. Positive = right. */
  offsetXPx: number;
  /** Vertical offset in CSS px. Positive = down. */
  offsetYPx: number;
  /** Blur radius in CSS px. */
  blurPx: number;
  /** Shadow color as 6-digit hex. */
  color: string;
};

export type StyleProbe = (selector: string) => ComputedStyle | null;

// ─────────────────────────────────────────────────────────────────────────
// CSS color parsing (matches mgfPptx.ts parseColor but inline to keep
// this module self-contained — same algorithm, no dependency).
// ─────────────────────────────────────────────────────────────────────────

const HEX_SHORT = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const HEX_FULL = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
const RGB_RE = /^rgba?\(\s*([\d.]+%?)\s*[,\s]\s*([\d.]+%?)\s*[,\s]\s*([\d.]+%?)/i;
const NAMED: Record<string, string> = {
  black: '000000', white: 'FFFFFF', red: 'FF0000', green: '008000',
  blue: '0000FF', yellow: 'FFFF00', cyan: '00FFFF', magenta: 'FF00FF',
  silver: 'C0C0C0', gray: '808080', grey: '808080', maroon: '800000',
  olive: '808000', lime: '00FF00', aqua: '00FFFF', teal: '008080',
  navy: '000080', fuchsia: 'FF00FF', purple: '800080', orange: 'FFA500',
  pink: 'FFC0CB', brown: 'A52A2A', gold: 'FFD700', indigo: '4B0082',
  transparent: '',
};
const COLOR_FALLBACK = 'FFFFFF';

function clampByte(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hex2(n: number): string {
  return clampByte(n).toString(16).padStart(2, '0').toUpperCase();
}

/**
 * Resolve any CSS color string to a 6-digit hex (no `#`). Returns
 * empty string for `transparent` so callers can detect "no fill".
 * PptxGenJS has no alpha channel, so `rgba()` / 8-char hex get alpha
 * dropped silently. `oklch()` / `lab()` / `var()` fall to white.
 */
function colorToHex(input: string): string {
  const raw = input.trim();
  if (!raw) return '';
  if (raw === 'transparent') return '';
  const short = raw.match(HEX_SHORT);
  if (short) return (short[1] + short[1] + short[2] + short[2] + short[3] + short[3]).toUpperCase();
  const full = raw.match(HEX_FULL);
  if (full) return (full[1] + full[2] + full[3]).toUpperCase();
  const named = NAMED[raw.toLowerCase()];
  if (named !== undefined) return named;
  const rgb = raw.match(RGB_RE);
  if (rgb) {
    const parseC = (s: string): number => (s.endsWith('%') ? (parseFloat(s) / 100) * 255 : parseFloat(s));
    return hex2(parseC(rgb[1])) + hex2(parseC(rgb[2])) + hex2(parseC(rgb[3]));
  }
  return COLOR_FALLBACK;
}

// ─────────────────────────────────────────────────────────────────────────
// Box-shadow parsing
// ─────────────────────────────────────────────────────────────────────────

/**
 * Parse a `box-shadow` value into offset / blur / color. The CSS spec
 * allows multiple shadows (comma-separated), but for the MGF design
 * system only single shadows are used, so we parse just the first.
 *
 * Supported forms:
 *   `6px 6px 0 #000`                  → offset 6,6 blur 0 color #000
 *   `6px 6px 0 0 rgba(0,0,0,0.5)`     → same with rgba color
 *   `0 4px 12px rgba(0,0,0,0.25)`      → offset 0,4 blur 12
 *   `inset 0 0 0 1px #000`             → inset shadows return null
 *                                       (PptxGenJS has no inset shadow)
 *
 * Returns null for inset / unknown / empty shadows.
 */
function parseBoxShadow(raw: string): ParsedBoxShadow | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === 'none') return null;
  // Inset shadows → drop; PPTX can't render them as a real primitive.
  if (/^inset\b/i.test(trimmed)) return null;

  // First shadow only (no commas in the MGF design system, but be safe).
  const first = trimmed.split(',')[0]!.trim();

  // Find the color — a hex/rgb/rgba/hsl/named token at the end or
  // front. We try the END first (most common: `6px 6px 0 #000`),
  // then the FRONT (legacy: `#000 6px 6px 0`).
  const tokens = first.split(/\s+(?![^()]*\))/);
  // Pull the color token (one whose first char is `#` or matches
  // rgb(/hsl(/or is a known named color).
  let colorStr = '';
  let numericStart = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!;
    if (t.startsWith('#') || /^rgba?\(/i.test(t) || /^hsla?\(/i.test(t) || NAMED[t.toLowerCase()] !== undefined) {
      colorStr = t;
      numericStart = i === 0 ? tokens.length : i;
      break;
    }
  }
  // Collect numeric offsets/blur in order.
  const numericTokens = tokens
  .map((t) => t.trim())
  .filter((t) => /^-?[\d.]/.test(t))
  .map((t) => parseFloat(t));
  if (numericTokens.length < 2) return null;
  // If the color was at the front, drop it from the numeric list.
  const offsets = numericStart > 0 ? numericTokens : numericTokens;

  return {
    offsetXPx: (offsets[0] ?? 0) || 0,
    offsetYPx: (offsets[1] ?? 0) || 0,
    blurPx: (offsets[2] ?? 0) || 0,
    color: colorStr ? colorToHex(colorStr) : '000000',
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Probe factory
// ─────────────────────────────────────────────────────────────────────────

/**
 * Build a StyleProbe from a live Document (the iframe's contentDocument).
 * The probe takes a CSS selector and returns the computed style of the
 * first matching element, or null if no element matches.
 *
 * This intentionally reads only the FIRST match. The design system uses
 * consistent class-to-style mappings, so picking the first element is
 * representative — if multiple `.mgf-card` elements exist, they all
 * share the same border-radius / fill / border.
 */
export function createProbe(doc: Document): StyleProbe {
  return (selector: string): ComputedStyle | null => {
    const el = doc.querySelector(selector);
    if (!el || !(el instanceof HTMLElement)) return null;
    const win = doc.defaultView;
    if (!win) return null;
    const cs = win.getComputedStyle(el);
    if (!cs) return null;
    const radius = parseFloat(cs.borderTopLeftRadius) || 0;
    const borderWidthPx = parseFloat(cs.borderTopWidth) || 0;
    return {
      borderTopLeftRadiusPx: radius,
      backgroundColor: colorToHex(cs.backgroundColor),
      borderColor: colorToHex(cs.borderTopColor),
      borderWidthPt: borderWidthPx * 0.75, // CSS px → pt
      boxShadow: parseBoxShadow(cs.boxShadow),
      color: colorToHex(cs.color),
    };
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Iframe lifecycle
// ─────────────────────────────────────────────────────────────────────────

/**
 * Load a slide's HTML in a hidden iframe, wait for fonts + images +
 * KaTeX, return the document + a probe + a teardown. The caller
 * invokes teardown() when the slide's renderers are done.
 *
 * Mirrors the iframe machinery in `slideDomWalker.ts` but is kept
 * independent (no DOM walker running, just enough to read styles).
 */
export async function withStyleProbe<T>(
  html: string,
  width: number,
  height: number,
  fn: (probe: StyleProbe) => Promise<T> | T,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 15000;
  if (!html) throw new Error('withStyleProbe: html is empty');
  if (width <= 0 || height <= 0) throw new Error('withStyleProbe: width/height must be positive');
  if (options.signal?.aborted) throw new Error('aborted');

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
  iframe.style.cssText = `
    position: fixed;
    top: 0;
    left: -99999px;
    width: ${width}px;
    height: ${height}px;
    border: 0;
    visibility: hidden;
    pointer-events: none;
  `;
  document.body.appendChild(iframe);

  try {
    // `load` may never fire in jsdom (no real layout). Race it
    // against a deadline so a non-browser environment doesn't hang.
    const { doc, win } = await new Promise<{ doc: Document; win: Window }>((resolve, reject) => {
      let settled = false;
      const onLoad = () => {
        if (settled) return;
        settled = true;
        const d = iframe.contentDocument;
        const w = iframe.contentWindow;
        if (!d || !w) {
          reject(new Error('iframe produced no document'));
          return;
        }
        resolve({ doc: d, win: w });
      };
      iframe.addEventListener('load', onLoad);
      iframe.srcdoc = html;
      setTimeout(() => {
        if (settled) return;
        settled = true;
        const d = iframe.contentDocument;
        const w = iframe.contentWindow;
        if (d && w) {
          resolve({ doc: d, win: w });
        } else {
          reject(new Error('iframe load timeout'));
        }
      }, Math.max(2000, timeoutMs));
    });

    // Wait for fonts + images + math.
    const fontsReady = 'fonts' in doc
      ? (doc as Document & { fonts: { ready: Promise<unknown> } }).fonts.ready
      : Promise.resolve();
    await Promise.race([
      fontsReady,
      new Promise((_, rej) => setTimeout(() => rej(new Error('fonts timeout')), timeoutMs)),
    ]);
    await Promise.all(
      Array.from(doc.images).map((img) =>
        img.complete && img.naturalWidth > 0
          ? null
          : new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true });
              img.addEventListener('error', () => resolve(), { once: true });
            }),
      ),
    );
    // Two animation frames so the layout has settled before we read
    // computed styles (otherwise border-radius can briefly report 0
    // because the iframe hasn't yet flushed layout).
    await new Promise<void>((r) => win.requestAnimationFrame(() => r()));
    await new Promise<void>((r) => win.requestAnimationFrame(() => r()));

    const probe = createProbe(doc);
    return await fn(probe);
  } finally {
    iframe.remove();
  }
}