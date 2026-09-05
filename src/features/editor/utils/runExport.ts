/**
 * Export orchestrator. Owns all six formats (zip / html / pptx / pdf /
 * png / jpg) so the dialog stays presentational.
 *
 * Streaming every format through here also lets us lazily
 * `import('modern-screenshot')` and `import('jspdf')` only when the
 * user actually picks a rasterized format, keeping the editor's main
 * bundle lean.
 *
 * Pagination rules
 * ----------------
 *
 *   deck type (presentation, carousel) → one page per slide
 *   scrollable (website, poster, …)    → one tall page at the
 *                                        document's full scroll height
 *
 * Both behave identically for HTML and ZIP; only the rasterized
 * formats actually need the geometric distinction.
 */

import type { ProjectFile } from '@/types/api';
import { isScrollableType } from './editorMode';
import { assemblePreviewHtml } from '@/features/editor/hooks/useAssemblePreview';
import { groupSlides } from './groupSlides';
import { rasterizeHtml, type RasterizeOptions } from './rasterize';
import { buildPdfFromPages, type PdfPageSpec, type PdfPageSize } from './exportPdf';
import { buildPptxPresentation } from './mgfPptx';
import { buildZip, downloadBytes } from '@/lib/zip';

export type ExportFormat = 'zip' | 'html' | 'pptx' | 'pdf' | 'png' | 'jpg';

export type ExportOptions = {
  /** Resolution multiplier for rasterized formats. 1..4. Default 2. */
  scale?: number;
  /** JPEG quality 0..1. Ignored for PNG. Default 0.92. */
  jpgQuality?: number;
  /** PDF page size. `slide` matches the raster aspect 1:1. */
  pdfPageSize?: PdfPageSize;
};

export type ExportPhase = 'idle' | 'rasterizing' | 'encoding' | 'zipping' | 'done' | 'error';

export type ExportProgress = {
  phase: ExportPhase;
  current: number;
  total: number;
  /** Optional human-readable message, surfaced in the dialog. */
  message?: string;
};

export type ExportRunInput = {
  format: ExportFormat;
  files: ProjectFile[];
  projectName: string;
  /** Project editor mode drives deck vs scrollable pagination. */
  projectType: string | undefined;
  /** LTR/RTL controls font injection, slides alignment, pptxgenjs rtlMode. */
  direction: 'ltr' | 'rtl';
  options?: ExportOptions;
  onProgress?: (p: ExportProgress) => void;
  signal?: AbortSignal;
};

export type ExportRunResult = {
  /** Filename (no path). The dialog calls `downloadBytes` against this. */
  filename: string;
  mime: string;
  bytes: Uint8Array;
};

/** Filing helpers (shared with the legacy 3-format dialog). */
function sanitizeFilename(name: string): string {
  return (
    name
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'project'
  );
}

function findFile(files: ProjectFile[], layer: string, name: string): ProjectFile | undefined {
  return files.find((f) => f.layer === layer && f.name === name);
}

/** Map a project-type to the natural slide canvas the rasterizer wants. */
function naturalDims(
  projectType: string | undefined,
): { width: number; height: number } {
  // Mirror `ScaledIframe.tsx`'s NATURAL_DIMS so the rasterized output
  // matches the preview. The default is 1280×720.
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

function report(input: ExportRunInput, p: ExportProgress): void {
  input.onProgress?.(p);
}

function mimeFor(format: ExportFormat): string {
  switch (format) {
    case 'zip':
      return 'application/zip';
    case 'html':
      return 'text/html;charset=utf-8';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
      return 'image/jpeg';
  }
}

/** Build the assembled HTML document for one slide (deck) or the whole
 *  project (single-page / scrollable). Always uses `interactive: false`.
 *  Exported so the PPTX hybrid pipeline can reuse the same assembler as
 *  PDF/PNG/JPG — one HTML output, multiple consumers. */
export function assembleSlideHtml(
  files: ProjectFile[],
  opts: { projectType: string | undefined; direction: 'ltr' | 'rtl' },
  slideIdx?: number,
): string {
  const layoutHtml = findFile(files, 'layout', 'layout.html')?.content ?? '';
  const layoutCss = findFile(files, 'layout', 'layout.css')?.content ?? '';
  const styleCss = findFile(files, 'style', 'style.css')?.content ?? '';
  const contentJson =
    findFile(files, 'content', 'data.json')?.content ??
    findFile(files, 'content', 'content.json')?.content ??
    null;

  if (opts.projectType && isScrollableType(opts.projectType) === false) {
    // Not scrollable + per-slide editor mode: assemble per slide.
    const slides = groupSlides(files);
    if (slideIdx == null) {
      const inner = slides.map((s) => s.files.slide?.content ?? '').join('\n');
      return assemblePreviewHtml({
        slideHtml: inner,
        slideCss: '',
        layoutCss,
        layoutHtml,
        styleCss,
        contentJson,
        direction: opts.direction,
        interactive: false,
      });
    }
    const group = slides[slideIdx];
    if (!group) {
      return assemblePreviewHtml({
        slideHtml: '',
        slideCss: '',
        layoutCss,
        layoutHtml,
        styleCss,
        contentJson,
        direction: opts.direction,
        interactive: false,
      });
    }
    return assemblePreviewHtml({
      slideHtml: group.files.slide?.content ?? '',
      slideCss: '',
      layoutCss,
      layoutHtml,
      styleCss,
      contentJson,
      direction: opts.direction,
      interactive: false,
    });
  }

  // Scrollable / single-page: assemble the whole document. We don't
  // honor `slideIdx` in that case because the page is monolithic.
  // Prefer a single `slide/content.html` if it exists (the canonical
  // single-page shape), otherwise concatenate every `slide-N.html` in
  // numeric order so the layout's `{{slides}}` placeholder expands
  // with the whole document. Without this, a website whose sections
  // live in `slide-01.html` … `slide-08.html` would export a near-empty
  // page (just the layout chrome with an empty `<main>`).
  const singlePage = findFile(files, 'slide', 'content.html')?.content;
  const slideHtml = singlePage
    ? singlePage
    : files
        .filter((f) => f.layer === 'slide' && /^slide-\d+\.html$/.test(f.name))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
        .map((f) => f.content ?? '')
        .join('\n');
  return assemblePreviewHtml({
    slideHtml,
    slideCss: '',
    layoutCss,
    layoutHtml,
    styleCss,
    contentJson,
    direction: opts.direction,
    interactive: false,
  });
}

async function rasterizeOne(
  html: string,
  width: number,
  height: number,
  opts: {
    scale: number;
    quality: number;
    format: 'png' | 'jpeg';
    fitContent?: boolean;
  },
  signal?: AbortSignal,
) {
  const rOpts: RasterizeOptions = {
    html,
    width,
    height,
    scale: opts.scale,
    format: opts.format,
    quality: opts.quality,
    fitContent: opts.fitContent,
    signal,
  };
  return rasterizeHtml(rOpts);
}

/** Plan: how many rasters we'll produce, plus dimensions. */
function planRasters(
  format: ExportFormat,
  files: ProjectFile[],
  projectType: string | undefined,
): { count: number; width: number; height: number } {
  const scrollable = isScrollableType(projectType);
  const dims = naturalDims(projectType);

  if (scrollable || format === 'html') {
    // Scrollable: one full-page raster. We use the natural width and
    // let the iframe grow vertically to the assembled document height
    // — but for the orchestrator we keep `height = naturalDims.h` and
    // measure the actual `scrollHeight` at raster time.
    return { count: 1, width: dims.width, height: dims.height };
  }
  // Deck: one raster per slide.
  const slides = groupSlides(files);
  return { count: slides.length || 1, width: dims.width, height: dims.height };
}

/** Top-level entrypoint. */
export async function runExport(input: ExportRunInput): Promise<ExportRunResult> {
  const baseName = sanitizeFilename(input.projectName);
  const opts = input.options ?? {};
  const scrollable = isScrollableType(input.projectType);

  // ── zip ────────────────────────────────────────────────────────────────
  if (input.format === 'zip') {
    const entries = input.files
      .filter((f) => f.content != null && f.content !== '')
      .map((f) => ({ name: `${f.layer}/${f.name}`, data: f.content ?? '' }));

    // Include the rendered `index.html` so the archive is directly
    // openable. PPTX is omitted from the archive because it's a
    // opaque format the user already has via the dialog.
    if (input.files.some((f) => f.layer === 'slide' || f.layer === 'layout')) {
      try {
        entries.push({
          name: 'index.html',
          data: assembleSlideHtml(input.files, {
            projectType: input.projectType,
            direction: input.direction,
          }),
        });
      } catch (err) {
        console.warn('[export] index.html skipped:', err);
      }
    }

    report(input, { phase: 'zipping', current: 1, total: 1, message: 'Building archive…' });
    const bytes = buildZip(entries);
    return { filename: `${baseName}.zip`, mime: mimeFor('zip'), bytes };
  }

  // ── html ───────────────────────────────────────────────────────────────
  if (input.format === 'html') {
    const html = assembleSlideHtml(input.files, {
      projectType: input.projectType,
      direction: input.direction,
    });
    report(input, { phase: 'encoding', current: 1, total: 1, message: 'Building HTML…' });
    const bytes = new TextEncoder().encode(html);
    return { filename: `${baseName}.html`, mime: mimeFor('html'), bytes };
  }

  // ── pptx ───────────────────────────────────────────────────────────────
  if (input.format === 'pptx') {
    report(input, { phase: 'encoding', current: 0, total: 1, message: 'Building PPTX…' });
    const bytes = await buildPptxPresentation({
      files: input.files,
      projectName: input.projectName,
      direction: input.direction,
    });
    report(input, { phase: 'done', current: 1, total: 1 });
    return { filename: `${baseName}.pptx`, mime: mimeFor('pptx'), bytes };
  }

  // ── rasterized formats (pdf / png / jpg) ──────────────────────────────
  const plan = planRasters(input.format, input.files, input.projectType);
  const scale = opts.scale ?? 2;
  const quality = opts.jpgQuality ?? 0.92;
  const format = input.format === 'jpg' ? 'jpeg' : 'png';

  const pages: PdfPageSpec[] = [];
  const imageDataUrls: string[] = [];
  const imageExt = input.format === 'jpg' ? 'jpg' : 'png';

  for (let i = 0; i < plan.count; i++) {
    if (input.signal?.aborted) throw new Error('aborted');
    report(input, {
      phase: 'rasterizing',
      current: i + 1,
      total: plan.count,
      message: scrollable
        ? 'Rasterizing page…'
        : `Rasterizing slide ${i + 1} of ${plan.count}…`,
    });
    const html = assembleSlideHtml(
      input.files,
      { projectType: input.projectType, direction: input.direction },
      scrollable ? undefined : i,
    );
    const capt = await rasterizeOne(
      html,
      plan.width,
      plan.height,
      { scale, quality, format, fitContent: scrollable },
      input.signal,
    );
    pages.push({
      dataUrl: capt.dataUrl,
      // Use the natural (pre-scale) dimensions so the PDF page matches
      // the document. For scrollable types this is the post-`fitContent`
      // iframe height; for deck types it equals `plan.{width,height}`.
      width: capt.naturalWidth ?? plan.width,
      height: capt.naturalHeight ?? plan.height,
      backgroundColor: '#050505',
    });
    imageDataUrls.push(capt.dataUrl);
  }

  // ── pdf ────────────────────────────────────────────────────────────────
  if (input.format === 'pdf') {
    report(input, { phase: 'encoding', current: 1, total: 1, message: 'Composing PDF…' });
    const bytes = await buildPdfFromPages(pages, {
      title: input.projectName,
      pageSize: opts.pdfPageSize ?? 'slide',
    });
    report(input, { phase: 'done', current: plan.count, total: plan.count });
    return { filename: `${baseName}.pdf`, mime: mimeFor('pdf'), bytes };
  }

  // ── png / jpg ──────────────────────────────────────────────────────────
  if (imageDataUrls.length === 1) {
    // Single image → straight download.
    const dataUrl = imageDataUrls[0];
    const comma = dataUrl.indexOf(',');
    const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : '';
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    report(input, { phase: 'done', current: 1, total: 1 });
    return {
      filename: `${baseName}.${imageExt}`,
      mime: mimeFor(imageExt === 'jpg' ? 'jpg' : 'png'),
      bytes,
    };
  }

  // Multi-slide raster export → ship as ZIP of images.
  report(input, { phase: 'zipping', current: 1, total: 1, message: 'Bundling images…' });
  const entries = imageDataUrls.map((dataUrl, i) => {
    const comma = dataUrl.indexOf(',');
    const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : '';
    const bin = atob(base64);
    const out = new Uint8Array(bin.length);
    for (let j = 0; j < bin.length; j++) out[j] = bin.charCodeAt(j);
    return {
      name: `${imageExt === 'jpg' ? 'jpg' : 'png'}/slide-${String(i + 1).padStart(2, '0')}.${imageExt}`,
      data: out,
    };
  });
  const bytes = buildZip(entries);
  report(input, { phase: 'done', current: plan.count, total: plan.count });
  return { filename: `${baseName}-${imageExt}-images.zip`, mime: mimeFor('zip'), bytes };
}

/** Convenience: trigger a browser download of an `ExportRunResult`. */
export function downloadExportResult(result: ExportRunResult): void {
  downloadBytes(result.bytes, result.filename, result.mime);
}
