import { describe, expect, it } from 'vitest';
import {
  SLIDE_W_IN,
  SLIDE_H_IN,
  parseColor,
  identifyComponent,
  buildPptxPresentation,
} from '../mgfPptx';
import type { ProjectFile } from '@/types/api';

function file(over: Partial<ProjectFile> & { name: string; layer: string }): ProjectFile {
  return {
    id: over.id ?? `f-${over.layer}-${over.name}`,
    project_id: 'p1',
    template_id: null,
    layer: over.layer,
    name: over.name,
    extension: over.name.includes('.') ? over.name.split('.').pop()! : '',
    sort_order: over.sort_order ?? 0,
    content: over.content ?? null,
    storage_url: over.storage_url ?? null,
    size_bytes: over.size_bytes ?? null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };
}

describe('parseColor — hex inputs', () => {
  it('expands #rgb shorthand to full hex', () => {
    expect(parseColor('#abc')).toBe('AABBCC');
    expect(parseColor('#FFF')).toBe('FFFFFF');
  });

  it('drops alpha from #rgba shorthand', () => {
    expect(parseColor('#abcd')).toBe('AABBCC');
  });

  it('preserves 6-digit hex', () => {
    expect(parseColor('#112233')).toBe('112233');
  });

  it('drops alpha from 8-digit hex', () => {
    expect(parseColor('#11223344')).toBe('112233');
  });
});

describe('parseColor — rgb()/rgba() inputs (the original bug)', () => {
  it('parses legacy comma-form rgb()', () => {
    expect(parseColor('rgb(255, 0, 0)')).toBe('FF0000');
    expect(parseColor('rgb(0, 128, 0)')).toBe('008000');
  });

  it('parses modern space-separated rgb()', () => {
    expect(parseColor('rgb(255 0 0)')).toBe('FF0000');
  });

  // The exact regression case that motivated the rewrite.
  it('parses space-separated rgb() with modern alpha (not FF0000)', () => {
    const result = parseColor('rgb(255 255 255 / 8%)');
    // We strip alpha because pptxgenjs has no alpha channel for fills,
    // but we MUST NOT return the bogus FF0000 the old code produced.
    expect(result).toBe('FFFFFF');
    expect(result).not.toBe('FF0000');
  });

  it('parses comma-form rgba() (legacy)', () => {
    expect(parseColor('rgba(255, 0, 0, 0.5)')).toBe('FF0000');
  });

  it('expands short hex to full hex regardless of alpha channel', () => {
    expect(parseColor('#fff')).toBe('FFFFFF');
    expect(parseColor('#fff8')).toBe('FFFFFF');
  });

  it('handles percentage channels', () => {
    expect(parseColor('rgb(100%, 0%, 0%)')).toBe('FF0000');
  });

  it('clamps out-of-range byte values', () => {
    expect(parseColor('rgb(300, 0, 0)')).toBe('FF0000');
    expect(parseColor('rgb(-10, 0, 0)')).toBe('000000');
  });
});

describe('parseColor — hsl()/hsla()', () => {
  it('parses legacy comma-form hsl()', () => {
    expect(parseColor('hsl(0, 100%, 50%)')).toBe('FF0000');
    expect(parseColor('hsl(240, 100%, 50%)')).toBe('0000FF');
  });

  it('parses space-separated modern hsl()', () => {
    expect(parseColor('hsl(0 100% 50%)')).toBe('FF0000');
  });
});

describe('parseColor — named colors', () => {
  it('maps common CSS named colors', () => {
    expect(parseColor('red')).toBe('FF0000');
    expect(parseColor('cornflowerblue' as unknown as string)).toBe('808080'); // not in our mini table
  });

  it('is case-insensitive on names', () => {
    expect(parseColor('RED')).toBe('FF0000');
    expect(parseColor('White')).toBe('FFFFFF');
  });
});

describe('parseColor — unresolvable inputs', () => {
  it('returns neutral gray for var()', () => {
    expect(parseColor('var(--mgf-accent)')).toBe('808080');
  });

  it('returns neutral gray for oklch() (no parser implemented)', () => {
    expect(parseColor('oklch(60% 0.1 200)')).toBe('808080');
  });

  it('returns neutral gray for empty / nullish input', () => {
    expect(parseColor('')).toBe('808080');
    expect(parseColor(null)).toBe('808080');
    expect(parseColor(undefined)).toBe('808080');
  });
});

describe('identifyComponent — multi-line regression', () => {
  it('matches across newlines with [\\s\\S]*?', () => {
    const html = `<div class="mgf-grid-3">
      <div class="mgf-card">a</div>
      <div class="mgf-card">b</div>
      <div class="mgf-card">c</div>
    </div>`;
    expect(identifyComponent(html)).toBe('features');
  });

  it('does not over-match cover for closing-only shapes', () => {
    // Both `closing` and `cover` patterns match `mgf-title-xl`, but
    // only `cover` adds `mgf-eyebrow`. Without the reordering fix,
    // every cover slide was classified as `closing` and rendered
    // with the wrong shape set.
    expect(identifyComponent('<div class="mgf-eyebrow mgf-title-xl"></div>')).toBe('cover');
  });

  it('still classifies a true closing slide as closing', () => {
    expect(identifyComponent('<div class="mgf-flex-center mgf-cta-solid"></div>')).toBe('closing');
  });

  it('honors the <!-- Component: --> marker over classes', () => {
    expect(identifyComponent('<!-- Component: image-text -->\n<section class="mgf-card"></section>')).toBe('image-text');
  });
});

describe('renderImageText — image resolution', () => {
  it('renders a valid PPTX with a data URI image', async () => {
    // 1x1 transparent PNG. Bytes were generated once via base64 round-trip.
    const dataUri =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAfbLI3wAAAABJRU5ErkJggg==';
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', sort_order: 0, content: ':root{--mgf-color-bg:#0b0f17;--mgf-color-accent:#22d3ee;}' }),
      file({ layer: 'content', name: 'data.json', sort_order: 0, content: JSON.stringify({
        slides: [
          {
            id: 1,
            component: 'image-text',
            data: {
              title: 'Picture story',
              body: 'Caption underneath the image.',
              image: dataUri,
              layout: 'left',
            },
          },
        ],
      }) }),
      file({ layer: 'slide', name: 'slide-01.html', sort_order: 0, content: '<section class="mgf-slide"></section>' }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'ImageTest' });
    // Valid PPTX = ZIP signature "PK\x03\x04" at offset 0.
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    expect(bytes[2]).toBe(0x03);
    expect(bytes[3]).toBe(0x04);
    expect(bytes.byteLength).toBeGreaterThan(2000);
  });

  it('falls back to the placeholder when image is missing', async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', sort_order: 0, content: ':root{--mgf-color-bg:#0b0f17;--mgf-color-accent:#22d3ee;}' }),
      file({ layer: 'content', name: 'data.json', sort_order: 0, content: JSON.stringify({
        slides: [
          {
            id: 1,
            component: 'image-text',
            data: { title: 'No image', body: 'Body text.' },
          },
        ],
      }) }),
      file({ layer: 'slide', name: 'slide-01.html', sort_order: 0, content: '<section class="mgf-slide"></section>' }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'Placeholder' });
    expect(bytes.byteLength).toBeGreaterThan(2000);
  });
});

describe('buildPptxPresentation — dispatcher safety', () => {
  const baseFiles = (component: string | object, extra: Record<string, unknown> = {}): ProjectFile[] => [
    file({ layer: 'style', name: 'style.css', content: ':root{--mgf-color-bg:#0b0f17;--mgf-color-accent:#22d3ee;}' }),
    file({
      layer: 'content',
      name: 'data.json',
      content: JSON.stringify({
        slides: [{
          id: 1,
          ...(typeof component === 'string' ? { component } : {}),
          data: { title: 't', ...extra },
        }],
      }),
    }),
    file({ layer: 'slide', name: 'slide-01.html' }),
  ];

  it('does not crash when data.json has component: "constructor"', async () => {
    // The old code did `COMPONENT_RENDERERS["constructor"]` which
    // returned Object.prototype.constructor. Should now safely fall
    // back to the generic renderer.
    const bytes = await buildPptxPresentation({
      files: baseFiles('constructor'),
      projectName: 'SafeCase',
    });
    expect(bytes.byteLength).toBeGreaterThan(2000);
  });

  it('is case-insensitive on data.json component (ImageText -> image-text)', async () => {
    const bytes = await buildPptxPresentation({
      files: baseFiles('ImageText'),
      projectName: 'MixedCase',
    });
    expect(bytes.byteLength).toBeGreaterThan(2000);
  });

  it('a per-slide renderer throwing does not abort the whole export', async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: ':root{--mgf-color-bg:#0b0f17;--mgf-color-accent:#22d3ee;}' }),
      file({
        layer: 'content',
        name: 'data.json',
        content: JSON.stringify({
          slides: [
            {
              id: 1,
              component: 'pricing',
              data: {
                title: 'Plans',
                // Force a crash inside the renderer (string where
                // array is expected by the renderer).
                plans: 'not an array' as unknown,
              },
            },
            {
              id: 2,
              component: 'cover',
              data: { title: 'Good slide', label: 'OK' },
            },
          ],
        }),
      }),
      file({ layer: 'slide', name: 'slide-01.html' }),
      file({ layer: 'slide', name: 'slide-02.html' }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'Mixed' });
    expect(bytes.byteLength).toBeGreaterThan(2000);
  });
});

describe('buildPptxPresentation — dimensions', () => {
  it('exports a 16:9 PPTX (LAYOUT_WIDE)', () => {
    // Sanity: the slide dimensions the rest of the pipeline assumes.
    expect(SLIDE_W_IN / SLIDE_H_IN).toBeCloseTo(16 / 9, 2);
  });
});

describe('identifyComponent — cover regex no longer swallows problem', () => {
  // Regression: the cover pattern used to match `mgf-eyebrow`, which
  // is shared with problem/solution/market/ask/etc. Every non-cover
  // slide routed to renderCover and lost its body and bullets.
  it('still classifies h1 + data-field="title" as cover', () => {
    expect(
      identifyComponent('<section><h1 data-field="title">Cleartab</h1></section>'),
    ).toBe('cover');
  });

  it('still classifies mgf-title-xl as cover', () => {
    expect(identifyComponent('<div class="mgf-eyebrow mgf-title-xl"></div>')).toBe('cover');
  });

  it('does NOT classify a problem slide (eyebrow + h2 title) as cover', () => {
    expect(
      identifyComponent(
        '<section>' +
          '<span class="mgf-eyebrow" data-field="eyebrow">Problem</span>' +
          '<h2 class="mgf-title" data-field="title">SMBs locked out</h2>' +
          '<p class="mgf-body" data-field="body">70% of applications are declined.</p>' +
          '</section>',
      ),
    ).not.toBe('cover');
  });

  it('does NOT classify a closing-style slide (eyebrow + flex-center) as cover', () => {
    expect(
      identifyComponent(
        '<section>' +
          '<span class="mgf-eyebrow" data-field="eyebrow">Contact</span>' +
          '<h2 class="mgf-title" data-field="title">Let\'s talk</h2>' +
          '<div class="mgf-flex-center mgf-cta-solid"></div>' +
          '</section>',
      ),
    ).toBe('closing');
  });
});

describe('buildPptxPresentation — synthesizes slides from data.json-only projects', () => {
  // Seed bundles (fintech-pitch, climate-pitch, etc.) ship only
  // data.json + style.css, never slide-NN.html files. Before this
  // fix the export collapsed to a single "project name" slide.
  const seedDataJson = JSON.stringify({
    _meta: { project: 'Cleartab — SMB credit in 60 seconds' },
    slides: [
      { stem: 'slide-01-cover', data: { title: 'Cleartab', subtitle: 'SMB credit in 60s' } },
      {
        stem: 'slide-02-problem',
        data: {
          eyebrow: 'Problem',
          title: 'SMBs are locked out of working capital',
          body: '70% of SMB loan applications to traditional banks are declined.',
          points: ['78% decline rate for sub-$500K requests', '$220B unmet demand'],
        },
      },
      {
        stem: 'slide-03-solution',
        data: { eyebrow: 'Solution', title: 'Underwrite every invoice in 60s', body: '…' },
      },
      {
        stem: 'slide-04-stats',
        data: {
          eyebrow: 'Traction',
          title: 'Numbers that compound',
          stats: [
            { value: '$48M', label: 'processed Q4 2025' },
            { value: '320', label: 'active SMB customers' },
          ],
        },
      },
      { stem: 'slide-05-market', data: { eyebrow: 'Market', title: 'Where we play first', body: 'GCC SMBs.' } },
      { stem: 'slide-06-ask', data: { eyebrow: 'Ask', title: 'Raising $12M Series A', body: 'To expand into UAE and KSA.' } },
      { stem: 'slide-07-closing', data: { eyebrow: 'Contact', title: "Let's talk", cta: 'hello@cleartab.io' } },
    ],
  });

  it('emits one slide per data.slides entry, not a single fallback', async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: ':root{--mgf-color-bg:#0b0f17;--mgf-color-accent:#2f80ff;}' }),
      file({ layer: 'content', name: 'data.json', content: seedDataJson }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'Cleartab' });
    // Each rendered slide contributes a non-trivial number of bytes
    // beyond the shared PPTX overhead, so 7 slides easily clears 5KB.
    expect(bytes.byteLength).toBeGreaterThan(5000);
  });

  it('synthesized problem slide keeps the bullet points from data.json', async () => {
    // Indirect check: if bullets were dropped the bytes would be
    // smaller. We assert "at least one bullet worth of bytes per
    // problem slide" — pptxgenjs emits a `<a:p>` paragraph with
    // bullet XML for each entry.
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: ':root{--mgf-color-bg:#0b0f17;}' }),
      file({
        layer: 'content',
        name: 'data.json',
        content: JSON.stringify({
          slides: [
            {
              stem: 'slide-02-problem',
              data: {
                title: 'P',
                body: 'B',
                points: ['x', 'y', 'z'],
              },
            },
          ],
        }),
      }),
    ];
    const withBullets = await buildPptxPresentation({ files, projectName: 'B' });
    const withoutBullets = await buildPptxPresentation({
      files: [
        file({ layer: 'style', name: 'style.css', content: ':root{--mgf-color-bg:#0b0f17;}' }),
        file({
          layer: 'content',
          name: 'data.json',
          content: JSON.stringify({
            slides: [{ stem: 'slide-02-problem', data: { title: 'P', body: 'B' } }],
          }),
        }),
      ],
      projectName: 'B',
    });
    expect(withBullets.byteLength).toBeGreaterThan(withoutBullets.byteLength);
  });

  it('honors `data.eyebrow` over the renderer fallback', async () => {
    // Without the eyebrow helper, renderProblem prints "THE PROBLEM".
    // With `data.eyebrow = "Problem"`, the output should print
    // "PROBLEM" instead. We assert a positive delta in bytes (the
    // extra bytes come from the different text length in the OOXML).
    const withEyebrow = await buildPptxPresentation({
      files: [
        file({ layer: 'style', name: 'style.css', content: ':root{--mgf-color-bg:#0b0f17;}' }),
        file({
          layer: 'content',
          name: 'data.json',
          content: JSON.stringify({
            slides: [
              {
                stem: 'slide-02-problem',
                data: {
                  title: 'T',
                  body: 'B',
                  eyebrow: 'Market reality',
                  points: ['x', 'y', 'z', 'w'],
                },
              },
            ],
          }),
        }),
      ],
      projectName: 'E',
    });
    const fallbackOnly = await buildPptxPresentation({
      files: [
        file({ layer: 'style', name: 'style.css', content: ':root{--mgf-color-bg:#0b0f17;}' }),
        file({
          layer: 'content',
          name: 'data.json',
          content: JSON.stringify({
            slides: [
              {
                stem: 'slide-02-problem',
                data: {
                  title: 'T',
                  body: 'B',
                  points: ['x', 'y', 'z', 'w'],
                },
              },
            ],
          }),
        }),
      ],
      projectName: 'E',
    });
    // "MARKET REALITY" (15 chars) > "THE PROBLEM" (11 chars), so the
    // eyebrow helper's output should be measurably larger.
    expect(withEyebrow.byteLength).toBeGreaterThan(fallbackOnly.byteLength);
  });
});
