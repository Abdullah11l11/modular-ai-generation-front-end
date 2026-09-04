/**
 * Hybrid PPTX builder.
 *
 * Strategy: for every slide, render the assembled HTML in a hidden
 * iframe, capture it as a PNG (used as the slide background), and
 * overlay native PptxGenJS text boxes at each `[data-field]` element's
 * measured position.
 *
 * The user gets a .pptx that:
 *   - looks visually identical to the editor preview (the raster is
 *     literally the editor's rendering),
 *   - exposes every text element as a real PowerPoint text box they can
 *     click, edit, drag, restyle,
 *   - keeps backgrounds / decorations / illustrations intact as the
 *     background image (moveable as a unit, but not editable per-pixel).
 *
 * This replaces the old component-by-component PptxGenJS rebuild in
 * `mgfPptx.ts`, which could never reach pixel-perfect and silently
 * dropped content the renderer didn't recognize. The old code remains
 * available — `runExport.ts` decides which entry point to call.
 */

import PptxGenJS from 'pptxgenjs';
import type { ProjectFile } from '@/types/api';
import { isScrollableType } from './editorMode';
import { groupSlides } from './groupSlides';
import { assembleSlideHtml } from './runExport';
import { rasterizeAndMeasure, type FieldMeasure } from './rasterizeAndMeasure';

// ─────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────

// PptxGenJS's LAYOUT_WIDE = 13.333 in × 7.5 in. CSS px-per-inch is 96,
// so a 1280×720 iframe maps 1:1 to that layout. For non-16:9 project
// types the slide stretches the PNG; native text boxes still track CSS
// pixels via the same /96 conversion (so a 1080×1080 carousel gets a
// square PNG stretched to 11.25×11.25 in with text boxes positioned
// proportionally).
const PX_PER_INCH = 96;

// Resolution multiplier for the raster capture. 2 = HiDPI-ish, large
// enough to survive PowerPoint's default "shrink on load" warning for
// slides that get printed. Keep at 2 to stay under the 4 MB PPTX media
// budget that triggers PowerPoint's media-optimization dialog.
const CAPTURE_SCALE = 2;

// ─────────────────────────────────────────────────────────────────────────
// Coordinate helpers
// ─────────────────────────────────────────────────────────────────────────

function pxToInches(px: number): number {
  return px / PX_PER_INCH;
}

/**
 * CSS pixels → PptxGenJS font-size in points. The conversion is
 * straightforward (1 CSS px = 0.75 pt) but doing it once at the call
 * site avoids confusion when reading the rest of the renderer.
 */
function pxToPoints(px: number): number {
  return px * 0.75;
}

// ─────────────────────────────────────────────────────────────────────────
// Per-field overlay
// ─────────────────────────────────────────────────────────────────────────

type Slide = PptxGenJS.Slide;

/**
 * Place a native PptxGenJS text box at the measured position. Multi-line
 * text is honored by passing the captured `innerText` directly — PptxGenJS
 * treats `\n` as a hard break.
 */
function addFieldOverlay(
  slide: Slide,
  field: FieldMeasure,
  direction: 'ltr' | 'rtl',
): void {
  // PptxGenJS uses `align` for horizontal text-align inside the box and
  // `valign` for vertical. The default `valign: 'top'` matches the
  // browser's text rendering for most typography patterns; explicit
  // `middle` would shift baselines noticeably.
  slide.addText(field.text, {
    x: pxToInches(field.x),
    y: pxToInches(field.y),
    w: pxToInches(field.width),
    h: pxToInches(field.height),
    fontFace: field.fontFamily,
    fontSize: Math.round(pxToPoints(field.fontSizePx)),
    color: field.color,
    bold: field.bold,
    italic: field.italic,
    align: field.textAlign,
    valign: 'top',
    // Inherit RTL only when the project's direction is RTL AND the
    // text is right-aligned (which the browser resolved for us). For
    // LTR text on an RTL slide (e.g. an English quote inside an Arabic
    // deck) we still want left-align behavior — PptxGenJS's
    // `rtlMode: true` would flip the cursor the wrong way.
    rtlMode: direction === 'rtl' && field.textAlign === 'right',
    // Wrap=false would crop long text; wrap=true wraps inside the box
    // and matches the browser's default white-space: normal. margin=0
    // because the measured rect already accounts for the element's
    // padding (we measured the element itself, not its content box).
    wrap: true,
    margin: 0,
    // `inset` doesn't exist on PptxGenJS — autoFit is the closest knob
    // for shrinking overflow text. Disabled by default; we sized the
    // box to the rendered element, so genuine overflow is rare.
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Slide HTML assembly per slide index
// ─────────────────────────────────────────────────────────────────────────

/**
 * Map a project type to the natural slide canvas (matches
 * `runExport.ts`'s `naturalDims`). Mirrored here so the PPTX builder
 * doesn't have to import a private helper.
 */
function naturalDims(projectType: string | undefined): { width: number; height: number } {
  switch (projectType) {
    case 'A4':
      return { width: 1240, height: 1754 };
    case '4/3':
      return { width: 1280, height: 960 };
    case '1/1':
      return { width: 1080, height: 1080 };
    default:
      return { width: 1280, height: 720 };
  }
}

/**
 * Build the assembled HTML for a single slide. We reuse the same
 * assembler as the PDF/PNG/JPG path (`assembleSlideHtml` in
 * `runExport.ts`) so the raster output is identical to what the user
 * sees in the editor preview.
 */
function buildSlideHtml(
  files: ProjectFile[],
  slideIdx: number,
  projectType: string | undefined,
  direction: 'ltr' | 'rtl',
): string {
  return assembleSlideHtml(
    files,
    { projectType, direction },
    isScrollableType(projectType) ? undefined : slideIdx,
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Failure placeholder
// ─────────────────────────────────────────────────────────────────────────

/**
 * Write a placeholder slide so a single failure doesn't abort the
 * whole deck. Mirrors the resilience behavior from `mgfPptx.ts:2330`.
 */
function addErrorPlaceholder(
  slide: Slide,
  index: number,
  reason: string,
  direction: 'ltr' | 'rtl',
): void {
  slide.background = { color: '0B0F17' };
  slide.addText(
    `[Slide ${index + 1} could not be rendered — ${reason}]`,
    {
      x: 0.83,
      y: 3.25,
      w: 11.67,
      h: 1,
      fontFace: 'Calibri',
      fontSize: 14,
      color: '94A3B8',
      align: direction === 'rtl' ? 'right' : 'left',
    },
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────────────────

export type HybridPptxOptions = {
  files: ProjectFile[];
  projectName: string;
  projectType: string | undefined;
  direction: 'ltr' | 'rtl';
  signal?: AbortSignal;
  /** Optional progress callback (1/1 granularity is fine — slides
   *  rasterize in sequence). */
  onProgress?: (current: number, total: number) => void;
};

/**
 * Build a .pptx using the hybrid approach: every slide is rendered to
 * a PNG and overlaid with native text boxes for editable content.
 * Returns a `Uint8Array` of the .pptx bytes (a ZIP archive).
 */
export async function buildHybridPptxPresentation(
  opts: HybridPptxOptions,
): Promise<Uint8Array> {
  const { files, projectName, projectType, direction, signal } = opts;
  const scrollable = isScrollableType(projectType);
  const dims = naturalDims(projectType);

  // For scrollable types the whole project is one slide; for deck
  // types we walk every slide group. Empty projects get a single
  // placeholder slide so PowerPoint doesn't reject the file.
  const total = scrollable ? 1 : Math.max(groupSlides(files).length, 1);

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = projectName;
  pptx.company = 'MGF';
  pptx.author = 'MGF Editor';
  pptx.rtlMode = direction === 'rtl';

  for (let i = 0; i < total; i++) {
    if (signal?.aborted) throw new Error('aborted');
    opts.onProgress?.(i + 1, total);

    const slide = pptx.addSlide();
    try {
      // Pass the full `files` array every iteration — `assembleSlideHtml`
      // uses `slideIdx` internally to pick the right `slide-NN.html`
      // and reuses the shared `style.css` / `data.json` / layout files.
      const html = buildSlideHtml(files, scrollable ? 0 : i, projectType, direction);
      const { dataUrl, fields } = await rasterizeAndMeasure({
        html,
        width: dims.width,
        height: dims.height,
        scale: CAPTURE_SCALE,
        signal,
      });
      // PptxGenJS embeds the PNG as a media part. `background.data` accepts
      // an `image/png;base64,…` string (with the MIME prefix), NOT raw
      // bytes and NOT a data URL fed via `path:` — the latter throws
      // `ERROR: Unable to read media` because pptxgenjs treats `path`
      // as a filesystem path. The dataUrl we get from modern-screenshot
      // is already in the right shape, so pass it straight through.
      slide.background = { data: dataUrl };
      for (const field of fields) {
        addFieldOverlay(slide, field, direction);
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.warn(`[pptxHybrid] slide ${i + 1} failed:`, err);
      addErrorPlaceholder(slide, i, reason, direction);
    }
  }

  const buf = await pptx.write({ outputType: 'arraybuffer' });
  return new Uint8Array(buf as ArrayBuffer);
}