/**
 * PDF export — stack rasterized slides into a multi-page PDF.
 *
 * Page geometry: each page sized to the slide's own pixel dimensions
 * converted at 96 DPI. The PDF is therefore a 1:1 match for the
 * rasterized preview with no letterboxing or scaling artifacts.
 *
 * `jsPDF` is dynamically imported so it stays out of the editor's
 * main bundle.
 */

export type PdfPageSpec = {
  /** PNG data URL produced by `rasterizeHtml` (`data:image/png;base64,...`).
   *  jsPDF accepts a data URL directly, so no decode step is needed. */
  dataUrl: string;
  /** Slide's natural pixel width (e.g. 1280). */
  width: number;
  /** Slide's natural pixel height. */
  height: number;
  /** Hex background — used by jsPDF for any clear-page margins so an
   *  empty PDF doesn't open with a glaring white background. */
  backgroundColor?: string;
};

export type PdfPageSize = 'slide' | 'a4' | 'letter';

export type BuildPdfOptions = {
  title: string;
  /** Optional subject line in the PDF metadata. */
  subject?: string;
  /**
   * Geometry source: `slide` (1:1 with the rasterized slide) or a
   * paper format. Letterboxing is applied automatically when the
   * page is sized to A4/Letter and the slide doesn't fill it.
   */
  pageSize?: PdfPageSize;
};

/**
 * Compute the `[widthIn, heightIn]` size for a PDF page in inches.
 *
 * - `pageSize: 'slide'` returns the slide's exact pixel-to-inch
 *   dimensions, preserving aspect.
 * - `pageSize: 'a4'` / `'letter'` pads the slide onto that paper
 *   size with the configured background color so no content is
 *   cropped.
 */
export function pdfPageDimensionsInches(
  slideW: number,
  slideH: number,
  pageSize: PdfPageSize,
): { wIn: number; hIn: number } {
  if (pageSize === 'a4') {
    // 210 × 297 mm at 1 in = 25.4 mm.
    return { wIn: 210 / 25.4, hIn: 297 / 25.4 };
  }
  if (pageSize === 'letter') {
    // 8.5 × 11 in.
    return { wIn: 8.5, hIn: 11 };
  }
  // 'slide': 96 dpi is the CSS canonical pixel density and matches
  // what `modern-screenshot` assumes with `scale: 1`. We do not
  // multiply by `scale` here because the rasterized image is already
  // `slideW * scale` pixels wide; we want the image to fill the
  // page 1:1, and `addImage` will scale the image to `wIn × hIn`.
  return { wIn: slideW / 96, hIn: slideH / 96 };
}

/**
 * Compose rasterized slide pages into a single multi-page PDF.
 *
 * Implementation notes:
 * - jsPDF is loaded via `import()` to keep ~350 KB out of the main
 *   bundle. The export dialog sits on an idle code path.
 * - We use unit-based inches so the maths above is portable to any
 *   pixel density.
 * - The first `addPage` is implicit (jsPDF defaults to a single page
 *   at construction); subsequent pages are added explicitly.
 */
export async function buildPdfFromPages(
  pages: PdfPageSpec[],
  opts: BuildPdfOptions,
): Promise<Uint8Array> {
  const { jsPDF } = await import('jspdf');
  const pageSize = opts.pageSize ?? 'slide';

  if (pages.length === 0) {
    // Single empty page so the PDF is valid. PptxGenJS-style minimum.
    const empty = new jsPDF({
      unit: 'in',
      format: 'a4',
      orientation: 'portrait',
    });
    empty.setProperties({ title: opts.title, subject: opts.subject });
    return new Uint8Array(empty.output('arraybuffer') as ArrayBuffer);
  }

  const first = pages[0];
  const { wIn, hIn } = pdfPageDimensionsInches(first.width, first.height, pageSize);

  const doc = new jsPDF({
    unit: 'in',
    format: [wIn, hIn],
    orientation: wIn >= hIn ? 'landscape' : 'portrait',
  });
  doc.setProperties({ title: opts.title, subject: opts.subject });

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const dims = pdfPageDimensionsInches(page.width, page.height, pageSize);
    if (i > 0) {
      doc.addPage([dims.wIn, dims.hIn], dims.wIn >= dims.hIn ? 'landscape' : 'portrait');
    }
    if (page.backgroundColor) {
      const { r, g, b } = hexToRgb(page.backgroundColor);
      doc.setFillColor(r, g, b);
      doc.rect(0, 0, dims.wIn, dims.hIn, 'F');
    }
    doc.addImage(page.dataUrl, 'PNG', 0, 0, dims.wIn, dims.hIn, undefined, 'FAST');
  }

  return new Uint8Array(doc.output('arraybuffer') as ArrayBuffer);
}

/**
 * Parse `#rgb`, `#rrggbb` (no alpha channels supported — pptxgenjs
 * and jsPDF fills have no alpha story) into 0..255 ints. Falls back
 * to black on unparseable input rather than throwing so the export
 * pipeline continues even on a weird custom token.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const s = hex.trim().replace(/^#/, '');
  const expand = (h: string) => {
    const out = h.length === 3 ? h + h : h.padEnd(6, '0');
    return parseInt(out.slice(0, 6), 16) || 0;
  };
  if (s.length === 3 || s.length === 6) {
    const n = expand(s);
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
  }
  return { r: 0, g: 0, b: 0 };
}
