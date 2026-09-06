/**
 * Smoke tests for the native PPTX builder.
 *
 * These mock `slideDomWalker.walkSlide` to return a deterministic
 * `SlideElement[]` so the test focuses on what `pptxNative` does with
 * the elements (turning them into native pptxgenjs shapes), not on the
 * DOM measurement path. The real walker is exercised manually in a
 * browser.
 *
 * What we verify:
 *   1. Output is a non-empty ZIP archive (PPTX is a ZIP).
 *   2. The output contains one slide XML entry per slide.
 *   3. The output does NOT contain a `ppt/media/` entry — the native
 *      pipeline never embeds an image for slide backgrounds. This is
 *      the central user requirement (Q1=C, no static images).
 *   4. The presentation metadata reflects `projectName`.
 *   5. An empty project still produces a valid single-slide deck.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import JSZip from 'jszip';
import type { ProjectFile } from '@/types/api';
import { buildNativePptxPresentation } from '../pptxNative';

// Mock the DOM walker so we don't depend on jsdom actually rendering
// iframes (it can't paint). The mock returns a synthetic mix of
// elements that exercises every shape kind: text, rect, roundRect,
// ellipse, and image.
vi.mock('../slideDomWalker', () => ({
  walkSlide: vi.fn(async () => [
    {
      kind: 'rect',
      x: 0,
      y: 0,
      w: 13.333,
      h: 7.5,
      fill: '0B0F17',
    },
    {
      kind: 'roundRect',
      x: 0.83,
      y: 1,
      w: 4,
      h: 1.5,
      fill: '1A1F2B',
      rectRadiusIn: 0.1,
    },
    {
      kind: 'ellipse',
      x: 1,
      y: 1.2,
      w: 0.5,
      h: 0.5,
      fill: 'F58220',
    },
    {
      kind: 'text',
      x: 1.5,
      y: 1.2,
      w: 3,
      h: 0.5,
      text: 'Hello world',
      fontFace: 'Calibri',
      fontSize: 28,
      color: 'FFFFFF',
      bold: true,
      align: 'left',
    },
  ]),
}));

function file(
  over: Partial<ProjectFile> & { name: string; layer: string; content?: string | null },
): ProjectFile {
  return {
    id: over.id ?? `f-${over.layer}-${over.name}`,
    project_id: 'p1',
    template_id: null,
    layer: over.layer,
    name: over.name,
    extension: over.name.includes('.') ? over.name.split('.').pop()! : '',
    sort_order: over.sort_order ?? 0,
    content: over.content ?? null,
    storage_url: null,
    size_bytes: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };
}

const STYLE_CSS = `
:root {
  --mgf-color-bg: #050505;
  --mgf-color-text-primary: #FFFFFF;
  --mgf-color-accent: #F58220;
  --mgf-font-display: "Inter", sans-serif;
  --mgf-font-body: "Inter", sans-serif;
}
body { background: var(--mgf-color-bg); color: var(--mgf-color-text-primary); }
`;

const SLIDE_HTML = `
<section class="mgf-slide">
  <span class="mgf-eyebrow" data-field="eyebrow">AI COURSE</span>
  <h1 data-field="title">Introduction to AI</h1>
  <p data-field="body">A foundational course.</p>
</section>
`;

describe('buildNativePptxPresentation — structural smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a valid ZIP (PK\\x03\\x04) archive', { timeout: 10000 }, async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({ layer: 'slide', name: 'slide-01.html', content: SLIDE_HTML, sort_order: 1 }),
    ];
    const bytes = await buildNativePptxPresentation({
      files,
      projectName: 'AI Course',
      projectType: 'presentation',
      direction: 'ltr',
    });
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(100);
    expect(bytes[0]).toBe(0x50); // P
    expect(bytes[1]).toBe(0x4b); // K
    expect(bytes[2]).toBe(0x03);
    expect(bytes[3]).toBe(0x04);
  });

  it('contains one slide XML per slide and NO slide-background raster', { timeout: 10000 }, async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({ layer: 'slide', name: 'slide-01.html', content: SLIDE_HTML, sort_order: 1 }),
      file({ layer: 'slide', name: 'slide-02.html', content: SLIDE_HTML, sort_order: 2 }),
    ];
    const bytes = await buildNativePptxPresentation({
      files,
      projectName: 'AI Course',
      projectType: 'presentation',
      direction: 'ltr',
    });
    const zip = await JSZip.loadAsync(bytes);
    const slideEntries = Object.keys(zip.files).filter((p) =>
      /^ppt\/slides\/slide\d+\.xml$/.test(p),
    );
    // Central user requirement: no static-image backgrounds. We verify
    // by inspecting each slide XML — it must NOT reference an image
    // (which would be the case if the slide background were a raster).
    // pptxgenjs creates an empty `ppt/media/` directory by default, so
    // we can't use that directory's presence as the signal.
    expect(slideEntries.length).toBe(2);
    const slide1 = await zip.file('ppt/slides/slide1.xml')?.async('string');
    expect(slide1).toBeDefined();
    expect(slide1).not.toContain('<a:blip');
    expect(slide1).not.toContain('<p:blipFill');
  });

  it('reflects the project name in the presentation core metadata', { timeout: 10000 }, async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({ layer: 'slide', name: 'slide-01.html', content: SLIDE_HTML, sort_order: 1 }),
    ];
    const bytes = await buildNativePptxPresentation({
      files,
      projectName: 'AI Course',
      projectType: 'presentation',
      direction: 'ltr',
    });
    const zip = await JSZip.loadAsync(bytes);
    const coreXml = await zip.file('docProps/core.xml')?.async('string');
    expect(coreXml).toBeDefined();
    expect(coreXml).toContain('AI Course');
  });

  it('emits a single slide for an empty project rather than failing', { timeout: 10000 }, async () => {
    const bytes = await buildNativePptxPresentation({
      files: [],
      projectName: 'Empty',
      projectType: 'presentation',
      direction: 'ltr',
    });
    const zip = await JSZip.loadAsync(bytes);
    const slideEntries = Object.keys(zip.files).filter((p) =>
      /^ppt\/slides\/slide\d+\.xml$/.test(p),
    );
    expect(slideEntries.length).toBe(1);
  });
});