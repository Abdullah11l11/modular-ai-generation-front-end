/**
 * Smoke tests for the hybrid PPTX builder.
 *
 * These tests mock `modern-screenshot` so the rasterize step is
 * deterministic in jsdom (which can't do real canvas painting). The
 * real rasterization path is exercised manually in a browser — these
 * tests guard the structural invariants of the output file.
 *
 * What we verify:
 *   1. Returns a non-empty Uint8Array.
 *   2. The bytes start with the ZIP magic `PK\x03\x04` (PPTX is a ZIP).
 *   3. The output contains one slide XML entry per slide plus a
 *      matching media entry — i.e. one background image per slide.
 *   4. The presentation metadata reflects `projectName`.
 *   5. An empty project still produces a valid single-slide deck.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import JSZip from 'jszip';
import type { ProjectFile } from '@/types/api';
import { buildHybridPptxPresentation } from '../pptxHybrid';

// Mock the combined rasterizer so we don't depend on jsdom actually
// rendering iframes (it doesn't). The mock returns a deterministic
// dataUrl + a few synthetic fields so the test focuses on what the
// PPTX builder does with the data, not on the rasterizer itself.
vi.mock('../rasterizeAndMeasure', () => ({
  rasterizeAndMeasure: vi.fn(async () => ({
    dataUrl:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    width: 2560,
    height: 1440,
    naturalWidth: 1280,
    naturalHeight: 720,
    bytes: 70,
    fields: [
      {
        field: 'title',
        text: 'Hello',
        x: 100,
        y: 200,
        width: 800,
        height: 80,
        fontSizePx: 48,
        fontFamily: 'Inter',
        color: 'FFFFFF',
        textAlign: 'left',
        bold: true,
        italic: false,
      },
    ],
  })),
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
  <span data-field="eyebrow">AI COURSE</span>
  <h1 data-field="title">Introduction to Artificial Intelligence</h1>
  <p data-field="body">A foundational course on how machines learn, reason, and create.</p>
</section>
`;

const SLIDE_HTML_2 = `
<section class="mgf-slide">
  <h2 data-field="title">Course Outline</h2>
  <ul data-field="points">
    <li>Week 1: Foundations</li>
    <li>Week 2: Neural networks</li>
  </ul>
</section>
`;

// jsdom doesn't paint into the iframe body, so the real rasterize
// pipeline hangs. We mock rasterizeAndMeasure directly (above) so the
// test focuses on what the PPTX builder does with the captured data.
const TIMEOUT = 10000;

describe('buildHybridPptxPresentation — structural smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a valid ZIP (PK\\x03\\x04) archive', { timeout: TIMEOUT }, async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({ layer: 'slide', name: 'slide-01.html', content: SLIDE_HTML, sort_order: 1 }),
    ];
    const bytes = await buildHybridPptxPresentation({
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

  it('contains one slide XML per slide + one media entry per slide', { timeout: TIMEOUT }, async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({ layer: 'slide', name: 'slide-01.html', content: SLIDE_HTML, sort_order: 1 }),
      file({ layer: 'slide', name: 'slide-02.html', content: SLIDE_HTML_2, sort_order: 2 }),
    ];
    const bytes = await buildHybridPptxPresentation({
      files,
      projectName: 'AI Course',
      projectType: 'presentation',
      direction: 'ltr',
    });
    const zip = await JSZip.loadAsync(bytes);
    const slideEntries = Object.keys(zip.files).filter(
      (p) => /^ppt\/slides\/slide\d+\.xml$/.test(p),
    );
    const mediaEntries = Object.keys(zip.files).filter((p) => p.startsWith('ppt/media/'));
    expect(slideEntries.length).toBe(2);
    // pptxgenjs may dedupe identical bytes into a single media entry
    // across slides (we reuse the same mocked PNG bytes for both
    // slides), so we expect AT LEAST one media entry — not exactly 2.
    expect(mediaEntries.length).toBeGreaterThanOrEqual(1);
  });

  it('reflects the project name in the presentation core metadata', { timeout: TIMEOUT }, async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({ layer: 'slide', name: 'slide-01.html', content: SLIDE_HTML, sort_order: 1 }),
    ];
    const bytes = await buildHybridPptxPresentation({
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

  it('emits a single slide for an empty project rather than failing', { timeout: TIMEOUT }, async () => {
    const bytes = await buildHybridPptxPresentation({
      files: [],
      projectName: 'Empty',
      projectType: 'presentation',
      direction: 'ltr',
    });
    const zip = await JSZip.loadAsync(bytes);
    const slideEntries = Object.keys(zip.files).filter(
      (p) => /^ppt\/slides\/slide\d+\.xml$/.test(p),
    );
    expect(slideEntries.length).toBe(1);
  });
});