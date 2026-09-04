/**
 * Combined slide rasterizer + field measurer.
 *
 * The PPTX hybrid pipeline needs two outputs from one rendered slide:
 *
 *   1. A full-bleed raster (PNG) → set as the slide background image so
 *      PowerPoint sees the exact same composition as the editor preview.
 *   2. Per-`[data-field]` measurements (rect + computed style) → place
 *      a native editable text box at the rendered position.
 *
 * Doing both in a single iframe pass halves the per-slide render cost
 * (one layout + font wait instead of two). The captured DOM lives long
 * enough to walk `[data-field]` elements and grab their bounding rects
 * before `domToPng` clones the canvas.
 *
 * Why a new module instead of extending `rasterize.ts`?
 *
 * - The PDF/PNG/JPG pipeline only needs the PNG; pulling measurement
 *   through it would force every caller to pay for the field walk.
 * - `rasterize.ts` returns an opaque base64 string. The hybrid builder
 *   needs the live DOM to read computed styles, so a tighter interface
 *   (iframe → measure → capture → teardown) is cleaner as its own
 *   abstraction.
 *
 * Coordinate system: the iframe is sized at the requested natural CSS
 * pixels (e.g. 1280×720). `getBoundingClientRect()` returns CSS pixels
 * relative to the iframe's viewport. To convert to PowerPoint inches,
 * the caller divides by 96 (CSS px-per-inch) — PptxGenJS's
 * `LAYOUT_WIDE` (13.333×7.5 in) happens to map 1280×720 → 13.333×7.5
 * exactly because 1280/96 ≈ 13.333 and 720/96 = 7.5. For non-16:9
 * projects the same /96 conversion still holds; the PNG stretches to
 * fill the slide and the text-box positions track CSS pixels.
 */

import { domToPng } from 'modern-screenshot';

export type FieldMeasure = {
  /** The `data-field` attribute value (e.g. `title`, `eyebrow`). */
  field: string;
  /** Visible text content, including line breaks for block elements. */
  text: string;
  /** Bounding rect in CSS pixels, relative to the iframe viewport. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Computed font-size in CSS pixels (callers convert to pt: ×0.75). */
  fontSizePx: number;
  /** Resolved font-family (first family from the computed stack). */
  fontFamily: string;
  /** Foreground color as a 6-digit hex string (no `#`). */
  color: string;
  /** Resolved text-align from the element's computed style. */
  textAlign: 'left' | 'right' | 'center' | 'justify';
  /** font-weight: bold >= 600. */
  bold: boolean;
  /** font-style: italic. */
  italic: boolean;
};

export type RasterizeAndMeasureOptions = {
  /** Assembled slide HTML (output of `assemblePreviewHtml({ interactive: false })`). */
  html: string;
  /** Natural slide width in CSS pixels (e.g. 1280). */
  width: number;
  /** Natural slide height in CSS pixels (e.g. 720). */
  height: number;
  /** Resolution multiplier for the captured PNG. Default 2 (HiDPI). */
  scale?: number;
  /** Body background. Default `#050505` to match `baseCss.ts`. */
  backgroundColor?: string;
  /** Max ms to wait for fonts/images/capture. Default 15000. */
  timeoutMs?: number;
  /** Optional AbortSignal so callers can cancel a long export. */
  signal?: AbortSignal;
};

export type RasterizeAndMeasureResult = {
  /** Captured PNG as `data:image/png;base64,…`. */
  dataUrl: string;
  /** Post-scale pixel width (width × scale). */
  width: number;
  /** Post-scale pixel height (height × scale). */
  height: number;
  /** Pre-scale natural dimensions — equals the iframe size. */
  naturalWidth: number;
  naturalHeight: number;
  /** Decoded byte length of the PNG payload. */
  bytes: number;
  /** Measured `[data-field]` elements, in DOM order. */
  fields: FieldMeasure[];
};

// ─────────────────────────────────────────────────────────────────────────
// Iframe lifecycle — mirrors rasterize.ts. Duplicated rather than
// exported because (a) rasterize.ts isn't ready to be a public API and
// (b) the duplication is ~60 lines and fully self-contained.
// ─────────────────────────────────────────────────────────────────────────

function withDeadline<T>(
  promise: Promise<T>,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<T> {
  if (signal?.aborted) return Promise.reject(new Error('aborted'));
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onAbort: (() => void) | undefined;
  return new Promise<T>((resolve, reject) => {
    const timeout = new Promise<never>((_, rej) => {
      timer = setTimeout(() => rej(new Error(`timed out after ${timeoutMs}ms`)), timeoutMs);
    });
    if (signal) {
      onAbort = () => {
        if (timer) clearTimeout(timer);
        reject(new Error('aborted'));
      };
      signal.addEventListener('abort', onAbort);
    }
    Promise.race([promise, timeout])
      .then((v) => {
        if (timer) clearTimeout(timer);
        if (signal && onAbort) signal.removeEventListener('abort', onAbort);
        resolve(v);
      })
      .catch((err) => {
        if (timer) clearTimeout(timer);
        if (signal && onAbort) signal.removeEventListener('abort', onAbort);
        reject(err);
      });
  });
}

async function waitForIframeReady(
  doc: Document,
  win: Window,
  timeoutMs: number,
): Promise<void> {
  const fontsReady =
    'fonts' in doc
      ? (doc as Document & { fonts: { ready: Promise<unknown> } }).fonts.ready
      : Promise.resolve();
  await withDeadline(Promise.resolve(fontsReady), timeoutMs);

  const images = Array.from(doc.images);
  await Promise.all(
    images.map((img) =>
      img.complete && img.naturalWidth > 0
        ? null
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          }),
    ),
  );

  // KaTeX gate — body.mgf-math-enabled only fires when the slide has math.
  if (doc.body.classList.contains('mgf-math-enabled')) {
    await withDeadline(
      new Promise<void>((resolve) => {
        const start = Date.now();
        const tick = () => {
          const katex = (win as unknown as { katex?: { render?: unknown } }).katex;
          if (katex && typeof katex.render === 'function') {
            setTimeout(resolve, 50);
            return;
          }
          if (Date.now() - start > timeoutMs) {
            resolve();
            return;
          }
          setTimeout(tick, 50);
        };
        tick();
      }),
      timeoutMs,
    );
  }
}

function buildHiddenIframe(width: number, height: number): {
  iframe: HTMLIFrameElement;
  teardown: () => void;
} {
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
  return { iframe, teardown: () => iframe.remove() };
}

function loadIntoIframe(
  iframe: HTMLIFrameElement,
  html: string,
): Promise<{ doc: Document; win: Window }> {
  return new Promise((resolve, reject) => {
    iframe.addEventListener('load', () => {
      try {
        const doc = iframe.contentDocument;
        const win = iframe.contentWindow;
        if (!doc || !win) {
          reject(new Error('iframe produced no document'));
          return;
        }
        if (!doc.documentElement) {
          setTimeout(() => resolve({ doc, win }), 0);
        } else {
          resolve({ doc, win });
        }
      } catch (err) {
        reject(err);
      }
    });
    iframe.srcdoc = html;
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Field measurement
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
 * Resolve a `getComputedStyle().color` value to a 6-digit hex (no `#`).
 * Falls back to white for any color space PptxGenJS can't represent
 * (e.g. `oklch()`, `lab()`, `color()`). Alpha is dropped intentionally
 * because pptxgenjs has no alpha channel for text colors.
 */
function colorToHex(input: string): string {
  const raw = input.trim();
  if (!raw) return COLOR_FALLBACK;
  const short = raw.match(HEX_SHORT);
  if (short) {
    return (short[1] + short[1] + short[2] + short[2] + short[3] + short[3]).toUpperCase();
  }
  const full = raw.match(HEX_FULL);
  if (full) {
    return (full[1] + full[2] + full[3]).toUpperCase();
  }
  const named = NAMED[raw.toLowerCase()];
  if (named) return named;
  const rgb = raw.match(RGB_RE);
  if (rgb) {
    const parseC = (s: string): number => {
      if (s.endsWith('%')) return (parseFloat(s) / 100) * 255;
      return parseFloat(s);
    };
    return hex2(parseC(rgb[1])) + hex2(parseC(rgb[2])) + hex2(parseC(rgb[3]));
  }
  return COLOR_FALLBACK;
}

/**
 * Walk the rendered DOM collecting `[data-field]` elements. Hidden
 * elements (display:none, visibility:hidden) and zero-rect ones are
 * dropped — they would otherwise land as invisible native text boxes
 * cluttering the PowerPoint outline.
 */
function measureFields(doc: Document): FieldMeasure[] {
  const out: FieldMeasure[] = [];
  const win = doc.defaultView;
  if (!win) return out;
  const nodes = Array.from(doc.querySelectorAll('[data-field]'));
  for (const el of nodes) {
    const field = el.getAttribute('data-field');
    if (!field) continue;
    // Only first occurrence per field-name is kept (mirrors
    // extractFieldsFromHtml's behavior in mgfPptx.ts). Later duplicates
    // would render as overlapping native text boxes.
    if (out.some((m) => m.field === field)) continue;
    const htmlEl = el as HTMLElement;
    const rect = htmlEl.getBoundingClientRect();
    // `getComputedStyle` returns resolved values; cheaper than parsing
    // the cascade manually and matches what the user sees.
    const style = win.getComputedStyle(htmlEl);
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    if (rect.width === 0 || rect.height === 0) continue;
    const align = style.textAlign;
    const textAlign: FieldMeasure['textAlign'] =
      align === 'right' || align === 'center' || align === 'justify' ? align : 'left';
    // textContent collapses block-level whitespace into a single space
    // and drops leading/trailing whitespace. `innerText` preserves
    // visible line breaks for block elements (paragraphs, list items)
    // but is heavier — fine here since we're talking <100 nodes.
    const text = (htmlEl.innerText ?? htmlEl.textContent ?? '').replace(/\u00A0/g, ' ');
    if (!text.trim()) continue;
    const fontFamily = (style.fontFamily || 'Calibri').split(',')[0].trim().replace(/^["']|["']$/g, '') || 'Calibri';
    out.push({
      field,
      text,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      fontSizePx: parseFloat(style.fontSize) || 16,
      fontFamily,
      color: colorToHex(style.color),
      textAlign,
      bold: parseInt(style.fontWeight, 10) >= 600,
      italic: style.fontStyle === 'italic',
    });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────────────────

const DEFAULT_BG = '#050505';

/**
 * Render a slide once, capture it as a PNG and measure every
 * `[data-field]` element. Returns both so the PPTX hybrid builder can
 * compose the slide from the raster background + native text overlays.
 */
export async function rasterizeAndMeasure(
  opts: RasterizeAndMeasureOptions,
): Promise<RasterizeAndMeasureResult> {
  const {
    html,
    width,
    height,
    scale = 2,
    backgroundColor = DEFAULT_BG,
    signal,
  } = opts;
  const timeoutMs = opts.timeoutMs ?? 15000;

  if (!html) throw new Error('rasterizeAndMeasure: html is empty');
  if (width <= 0 || height <= 0) throw new Error('rasterizeAndMeasure: width/height must be positive');
  if (scale < 1 || scale > 4) throw new Error('rasterizeAndMeasure: scale must be between 1 and 4');

  const { iframe, teardown } = buildHiddenIframe(width, height);
  try {
    const { doc, win } = await withDeadline(loadIntoIframe(iframe, html), timeoutMs, signal);
    await withDeadline(waitForIframeReady(doc, win, timeoutMs), timeoutMs, signal);

    // Measure first, then capture. Modern-screenshot clones the DOM
    // node internally, but `getComputedStyle` is cheap and only needs
    // the live doc to still exist.
    const fields = measureFields(doc);

    const dataUrl = await withDeadline(
      domToPng(doc.body, {
        width,
        height,
        scale,
        backgroundColor,
        type: 'image/png',
      }),
      timeoutMs,
      signal,
    );

    const comma = dataUrl.indexOf(',');
    const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : '';
    const bytes = base64 ? Math.floor((base64.length * 3) / 4) : 0;

    return {
      dataUrl,
      width: Math.round(width * scale),
      height: Math.round(height * scale),
      naturalWidth: width,
      naturalHeight: height,
      bytes,
      fields,
    };
  } finally {
    teardown();
  }
}