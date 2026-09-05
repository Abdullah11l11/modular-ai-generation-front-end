/**
 * Native PPTX builder.
 *
 * For every slide, render the HTML in a hidden iframe, walk the DOM to
 * produce a `SlideElement[]`, and emit one PptxGenJS shape per element.
 * No rasterization: every visual primitive is a native PowerPoint
 * object — text box, rectangle, round-rectangle, ellipse, line, or
 * image — that the user can click, edit, restyle, and reposition in
 * PowerPoint.
 *
 * The walker (`slideDomWalker.ts`) is deliberately generic: it visits
 * every visible DOM node and emits shapes based on tag + `mgf-*` class.
 * This builder is also generic — it just translates each
 * `SlideElement` into the matching pptxgenjs API call. Per-archetype
 * knowledge lives only in the CSS (the design system); we don't need
 * a separate renderer per slide type.
 *
 * Coordinate system: 1 CSS px = 1/96 in. The iframe is sized at the
 * project's natural slide dimensions (e.g. 1280×720 for a deck, 1080×
 * 1080 for a 1:1 project), so the walker's measurements convert
 * directly to PptxGenJS's inch-based shape geometry.
 */

import PptxGenJS from 'pptxgenjs';
import type { ProjectFile } from '@/types/api';
import { isScrollableType } from './editorMode';
import { groupSlides } from './groupSlides';
import { assembleSlideHtml } from './runExport';
import {
  walkSlide,
  type EllipseElement,
  type ImageElement,
  type RectElement,
  type SlideElement,
  type TextElement,
} from './slideDomWalker';

// ─────────────────────────────────────────────────────────────────────────
// Slide dimensions
// ─────────────────────────────────────────────────────────────────────────

/**
 * Map project type → natural slide canvas. Mirrors `runExport.ts`'s
 * `naturalDims`; duplicated so this module doesn't depend on a private
 * helper.
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
// Element emitters
// ─────────────────────────────────────────────────────────────────────────

type PptxSlide = PptxGenJS.Slide;

/**
 * Emit a text box. PptxGenJS uses `\n` for line breaks; the walker
 * already preserves block-level newlines via `innerText`. Rich inline
 * formatting (bold/italic spans within a paragraph) is collapsed to
 * the parent's computed style for v1.
 */
function emitText(slide: PptxSlide, t: TextElement): void {
  if (!t.text) return;
  slide.addText(t.text, {
    x: t.x,
    y: t.y,
    w: t.w,
    h: t.h,
    fontFace: t.fontFace ?? 'Calibri',
    fontSize: t.fontSize ?? 14,
    color: t.color ?? '000000',
    bold: t.bold,
    italic: t.italic,
    underline: t.underline ? { style: 'sng' } : undefined,
    align: t.align ?? 'left',
    valign: t.valign ?? 'top',
    // Wrap=true is the default; we set it explicitly so multi-line
    // text inside a measured box doesn't overflow horizontally.
    wrap: true,
    margin: 0,
  });
}

function emitRect(slide: PptxSlide, r: RectElement): void {
  const opts: PptxGenJS.ShapeProps = {
    x: r.x,
    y: r.y,
    w: r.w,
    h: r.h,
    fill: r.fill ? { color: r.fill } : { type: 'none' },
    line: r.border
      ? { color: r.border, width: r.borderWidthPt ?? 1 }
      : { type: 'none' },
  };
  if (r.kind === 'roundRect' && r.rectRadiusIn) {
    slide.addShape('roundRect', { ...opts, rectRadius: r.rectRadiusIn });
  } else {
    slide.addShape('rect', opts);
  }
}

function emitEllipse(slide: PptxSlide, e: EllipseElement): void {
  slide.addShape('ellipse', {
    x: e.x,
    y: e.y,
    w: e.w,
    h: e.h,
    fill: e.fill ? { color: e.fill } : { type: 'none' },
    line: e.border
      ? { color: e.border, width: e.borderWidthPt ?? 1 }
      : { type: 'none' },
  });
  // Overlay text (chapter-num, step-num, avatar initial). Centered on
  // the ellipse's bounding rect.
  if (e.overlayText) {
    slide.addText(e.overlayText, {
      x: e.x,
      y: e.y,
      w: e.w,
      h: e.h,
      fontFace: e.overlayFontFace ?? 'Calibri',
      fontSize: e.overlayFontSize ?? 14,
      color: e.overlayColor ?? '000000',
      bold: e.overlayBold,
      align: 'center',
      valign: 'middle',
      margin: 0,
      wrap: false,
    });
  }
}

function emitImage(slide: PptxSlide, img: ImageElement): void {
  // PptxGenJS's addImage accepts:
  //   - data: 'image/png;base64,...' (MIME-prefixed base64)
  //   - path: http(s) URL or filesystem path
  // We dispatch on the src prefix.
  if (img.src.startsWith('data:')) {
    slide.addImage({ data: img.src, x: img.x, y: img.y, w: img.w, h: img.h });
  } else {
    slide.addImage({ path: img.src, x: img.x, y: img.y, w: img.w, h: img.h });
  }
}

function emitElement(slide: PptxSlide, el: SlideElement): void {
  switch (el.kind) {
    case 'text':
      emitText(slide, el);
      return;
    case 'rect':
    case 'roundRect':
      emitRect(slide, el);
      return;
    case 'ellipse':
      emitEllipse(slide, el);
      return;
    case 'line':
      // We collapse CSS dividers into thin rectangles in the walker
      // (see buildLineElement), so this branch should be unreachable.
      return;
    case 'image':
      emitImage(slide, el);
      return;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────────────────

export type NativePptxOptions = {
  files: ProjectFile[];
  projectName: string;
  projectType: string | undefined;
  direction: 'ltr' | 'rtl';
  signal?: AbortSignal;
  /** Optional progress callback. */
  onProgress?: (current: number, total: number) => void;
};

/**
 * Build a .pptx where every visible element on every slide is a
 * native PowerPoint object. No rasterization happens — the only thing
 * the iframe is used for is measuring positions and computed styles.
 * Returns a `Uint8Array` of the .pptx bytes (a ZIP archive).
 */
export async function buildNativePptxPresentation(
  opts: NativePptxOptions,
): Promise<Uint8Array> {
  const { files, projectName, projectType, direction, signal } = opts;
  const dims = naturalDims(projectType);

  // Scrollable = one virtual slide containing the whole document; deck
  // = one slide per slide file. Empty projects get a single empty
  // slide so PowerPoint doesn't reject the file.
  const total = isScrollableType(projectType)
    ? 1
    : Math.max(groupSlides(files).length, 1);

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
      const html = buildSlideHtml(files, isScrollableType(projectType) ? 0 : i, projectType, direction);
      const elements = await walkSlide({
        html,
        width: dims.width,
        height: dims.height,
        signal,
      });
      // PPTX renders shapes in z-order; we want text drawn AFTER its
      // container background so the text isn't covered. The walker
      // already produces container shapes before children (we emit the
      // container then recurse), so iterating in array order preserves
      // the correct stacking.
      for (const el of elements) {
        emitElement(slide, el);
      }
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.warn(`[pptxNative] slide ${i + 1} failed:`, err);
      // Placeholder slide — solid background + a small note in the
      // center. Keeps the deck valid even if one slide's HTML fails to
      // render in the iframe.
      slide.background = { color: '0B0F17' };
      slide.addText(
        `[Slide ${i + 1} could not be rendered — ${reason}]`,
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
  }

  const buf = await pptx.write({ outputType: 'arraybuffer' });
  return new Uint8Array(buf as ArrayBuffer);
}