import { describe, expect, it, vi } from 'vitest';
import JSZip from 'jszip';
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

describe('buildPptxPresentation — cover renders all hero fields', () => {
  // Regression: renderCover previously read only
  // `title / subtitle / label / author / date` and silently dropped
  // everything else. Hero-style covers (e.g. brutalist launch
  // decks) carry `eyebrow`, `id` (chapter-num), `primary_cta`, and
  // `secondary_cta` — those now render as accent-bar eyebrow,
  // chapter-num block, solid CTA button, and inline CTA link. We
  // assert byte-count growth to prove each field contributes to
  // the output rather than being silently dropped.
  const baseFiles = (data: Record<string, unknown>): ProjectFile[] => [
    file({ layer: 'style', name: 'style.css', content: ':root{--mgf-color-bg:#FBF7EE;--mgf-color-accent:#FF3DAA;--mgf-color-text-primary:#0A0A0A;}' }),
    file({
      layer: 'content',
      name: 'data.json',
      content: JSON.stringify({ slides: [{ id: 1, component: 'cover', data }] }),
    }),
    file({
      layer: 'slide',
      name: 'slide-01.html',
      content:
        '<section class="mgf-slide">' +
        '<h1 class="mgf-title-xl" data-field="title">KONKRET</h1>' +
        '</section>',
    }),
  ];

  it('renders a minimal cover (title only)', async () => {
    const bytes = await buildPptxPresentation({
      files: baseFiles({ title: 'T' }),
      projectName: 'Minimal',
    });
    expect(bytes.byteLength).toBeGreaterThan(2000);
  });

  it('renders eyebrow + chapter-num + subtitle + CTAs (full hero cover)', async () => {
    const heroFiles = baseFiles({
      eyebrow: '2026 LAUNCH DECK',
      id: '01',
      title: 'KONKRET',
      subtitle: 'The productivity app that does not lie to you.',
      primary_cta: 'Get Early Access',
      secondary_cta: 'Watch the demo',
    });
    const minimalFiles = baseFiles({ title: 'T' });
    const [heroBytes, minimalBytes] = await Promise.all([
      buildPptxPresentation({ files: heroFiles, projectName: 'Hero' }),
      buildPptxPresentation({ files: minimalFiles, projectName: 'Minimal' }),
    ]);
    // Each new field adds at least one shape / text element, so the
    // hero output must be measurably larger than the minimal cover.
    expect(heroBytes.byteLength).toBeGreaterThan(minimalBytes.byteLength + 500);
  });
});

describe('buildPptxPresentation — dimensions', () => {
  it('exports a 16:9 PPTX (LAYOUT_WIDE)', () => {
    // Sanity: the slide dimensions the rest of the pipeline assumes.
    expect(SLIDE_W_IN / SLIDE_H_IN).toBeCloseTo(16 / 9, 2);
  });
});

describe('buildPptxPresentation — indexed-field data shapes', () => {
  // Regression: brutalist-style decks (e.g. KONKRET launch deck)
  // ship per-slide data as indexed fields like
  // `feature_1_title`, `feature_1_desc`, `pain_1_body`,
  // `stat_1_value`, `stat_1_label` — NOT as the standard
  // `features[]` / `points[]` / `stats[]` arrays. The renderers
  // previously read only the array form and dropped every
  // indexed field, so the PPTX was a wall of titles. We now
  // synthesize the array via `extractNumberedFields` whenever the
  // array is missing. These tests prove each renderer emits
  // measurably more bytes when indexed fields are present.
  const buildFiles = (component: string, data: Record<string, unknown>): ProjectFile[] => [
    file({ layer: 'style', name: 'style.css', content: ':root{--mgf-color-bg:#FBF7EE;--mgf-color-accent:#FF3DAA;--mgf-color-text-primary:#0A0A0A;}' }),
    file({
      layer: 'content',
      name: 'data.json',
      content: JSON.stringify({ slides: [{ id: 1, component, data }] }),
    }),
    file({ layer: 'slide', name: 'slide-01.html', content: '<section class="mgf-slide"></section>' }),
  ];

  it('renderFeatures renders 6 features from feature_N_* fields', async () => {
    const indexed = buildFiles('features', {
      eyebrow: 'The Fix',
      title: 'Six brutal features',
      lede: 'We cut the rest.',
      feature_1_icon: 'Aa', feature_1_title: 'Plain text', feature_1_desc: 'Markdown in. Markdown out.',
      feature_2_icon: 'DB', feature_2_title: 'Local-first', feature_2_desc: 'Your data lives on your disk.',
      feature_3_icon: 'NO', feature_3_title: 'Zero pings', feature_3_desc: 'If we ping you, something is on fire.',
      feature_4_icon: 'K_', feature_4_title: 'Keyboard complete', feature_4_desc: 'Every action has a keybinding.',
      feature_5_icon: 'IO', feature_5_title: 'Open formats', feature_5_desc: 'Export to plain markdown and CSV.',
      feature_6_icon: '$1', feature_6_title: 'Pay once', feature_6_desc: 'No subscription. No Pro tier.',
    });
    const empty = buildFiles('features', { title: 'T' });
    const [indexedBytes, emptyBytes] = await Promise.all([
      buildPptxPresentation({ files: indexed, projectName: 'Hero' }),
      buildPptxPresentation({ files: empty, projectName: 'Empty' }),
    ]);
    expect(indexedBytes.byteLength).toBeGreaterThan(emptyBytes.byteLength + 800);
  });

  it('renderStats renders 4 stats from stat_N_* fields', async () => {
    const indexed = buildFiles('stats', {
      eyebrow: 'By the Numbers',
      title: 'KONKRET ships where others stall',
      stat_1_value: '3.2x', stat_1_label: 'Faster than the category leader',
      stat_2_value: '0 MB', stat_2_label: 'Of telemetry we collect',
      stat_3_value: '98%', stat_3_label: 'Still active at day 30',
      stat_4_value: '$49', stat_4_label: 'One-time price',
    });
    const empty = buildFiles('stats', { title: 'T' });
    const [indexedBytes, emptyBytes] = await Promise.all([
      buildPptxPresentation({ files: indexed, projectName: 'Hero' }),
      buildPptxPresentation({ files: empty, projectName: 'Empty' }),
    ]);
    expect(indexedBytes.byteLength).toBeGreaterThan(emptyBytes.byteLength + 600);
  });

  it('renderProblem renders pain_N_* as bullet points', async () => {
    const indexed = buildFiles('problem', {
      eyebrow: 'The Problem',
      title: 'Every productivity app is the same lukewarm soup',
      body: 'You signed up for focus. You got notifications.',
      pain_1_title: 'Bloat', pain_1_body: '50 plus features. You use 4.',
      pain_2_title: 'Drama', pain_2_body: 'Streaks that shame you.',
      pain_3_title: 'Drag', pain_3_body: 'Onboarding tours that drag on.',
    });
    const empty = buildFiles('problem', { title: 'T' });
    const [indexedBytes, emptyBytes] = await Promise.all([
      buildPptxPresentation({ files: indexed, projectName: 'Hero' }),
      buildPptxPresentation({ files: empty, projectName: 'Empty' }),
    ]);
    expect(indexedBytes.byteLength).toBeGreaterThan(emptyBytes.byteLength + 400);
  });

  it('renderClosing renders primary_cta + contact_label', async () => {
    const indexed = buildFiles('closing', {
      eyebrow: 'Stop planning. Start shipping.',
      title: 'Join the brutalist beta.',
      lede: 'We are shipping the first 1,000 seats on December 1, 2026.',
      primary_cta: 'Reserve a seat',
      contact_label: 'hello@konkret.app',
    });
    const empty = buildFiles('closing', { title: 'T' });
    const [indexedBytes, emptyBytes] = await Promise.all([
      buildPptxPresentation({ files: indexed, projectName: 'Hero' }),
      buildPptxPresentation({ files: empty, projectName: 'Empty' }),
    ]);
    expect(indexedBytes.byteLength).toBeGreaterThan(emptyBytes.byteLength + 400);
  });
});

describe('buildPptxPresentation — data-shape inference (root-cause fix)', () => {
  // Regression: when a slide's stem doesn't end in a recognized
  // component name (e.g. `slide-02-by-the-numbers`,
  // `slide-05-tradeoffs`, `slide-06-market`, `slide-03-product`,
  // `slide-05-thanks`), the synthesizer used to stuff the suffix
  // into `data.json.slides[].component`. The renderer then routed
  // those slides to `renderGeneric` and silently dropped every
  // rich array (`stats[]`, `features[]`, `points[]`, …). The
  // structural fix: `resolveComponent` now inspects the data shape
  // and dispatches to the matching renderer as a final fallback.
  //
  // Each test below builds a slide WITHOUT a `component` field
  // (forcing inference) and WITHOUT a registered stem suffix,
  // then asserts the byte count proves the right renderer ran.
  const buildSeedFiles = (data: Record<string, unknown>): ProjectFile[] => [
    file({ layer: 'style', name: 'style.css', content: ':root{--mgf-color-bg:#FBF7EE;--mgf-color-accent:#FF3DAA;--mgf-color-text-primary:#0A0A0A;}' }),
    file({
      layer: 'content',
      name: 'data.json',
      content: JSON.stringify({
        slides: [
          // Stem whose suffix is NOT a registered component.
          // Without inference this would render as a generic
          // title+body slide and lose every array.
          { stem: 'slide-02-by-the-numbers', data },
        ],
      }),
    }),
  ];

  it('infers stats from stats[] and renders the tiles', async () => {
    const rich = buildSeedFiles({
      eyebrow: 'By the Numbers',
      title: 'What 2025 looked like',
      stats: [
        { value: '1,240', label: 'scholarships funded' },
        { value: '37', label: 'partner schools' },
        { value: '$4.8M', label: 'disbursed in grants' },
        { value: '92%', label: 'enrolled' },
      ],
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    // 4 stat tiles = 4 addText + 4 addShape calls. Each contributes
    // measurably more bytes than the generic renderer.
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 600);
  });

  it('infers features from features[] and renders the cards', async () => {
    const rich = buildSeedFiles({
      eyebrow: 'What you get',
      title: 'Three things',
      features: [
        { icon: 'A', title: 'Plain text', desc: 'Markdown in. Markdown out.' },
        { icon: 'B', title: 'Local-first', desc: 'Your data lives on your disk.' },
        { icon: 'C', title: 'Open formats', desc: 'Export anywhere.' },
      ],
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 500);
  });

  it('infers problem from points[] (and bullets[]) and renders bullets', async () => {
    const rich = buildSeedFiles({
      eyebrow: 'Problem',
      title: 'SMBs locked out',
      body: '70% are declined.',
      points: [
        '78% decline rate for sub-$500K requests',
        '$220B unmet demand',
        'Manual underwriting does not scale',
      ],
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 400);
  });

  it('infers pricing from plans[]', async () => {
    const rich = buildSeedFiles({
      title: 'Plans',
      plans: [
        { name: 'Hobby', price: '$0', period: '/mo', features: ['5 GB / month'] },
        { name: 'Team', price: '$49', period: '/mo', features: ['100 GB included'] },
        { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited'] },
      ],
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 700);
  });

  it('infers pricing from tiers[] (alternate name)', async () => {
    const rich = buildSeedFiles({
      title: 'Plans',
      tiers: [
        { name: 'Hobby', price: '$0', period: '/mo', bullets: ['5 GB'] },
        { name: 'Team', price: '$49', period: '/mo', bullets: ['100 GB'] },
        { name: 'Enterprise', price: 'Custom', period: '', bullets: ['Unlimited'] },
      ],
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 700);
  });

  it('infers team from members[]', async () => {
    const rich = buildSeedFiles({
      title: 'Team',
      members: [
        { name: 'Alice', role: 'CEO', bio: 'Built two startups.' },
        { name: 'Bob', role: 'CTO', bio: 'Ex-Google.' },
        { name: 'Carol', role: 'CFO', bio: 'Public-company veteran.' },
      ],
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 500);
  });

  it('infers faq from items[] with q/a keys', async () => {
    const rich = buildSeedFiles({
      title: 'Common questions',
      items: [
        { q: 'Do you ship internationally?', a: 'Yes — to 32 countries.' },
        { q: 'Can I cancel anytime?', a: 'Yes, one click.' },
      ],
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 300);
  });

  it('infers timeline from items[] with date/headline keys', async () => {
    const rich = buildSeedFiles({
      title: 'Timeline',
      items: [
        { date: '2024 Q1', headline: 'Founded', desc: 'Two co-founders.' },
        { date: '2024 Q3', headline: 'Seed', desc: 'Raised $2M.' },
        { date: '2025 Q1', headline: 'Launch', desc: 'Public release.' },
      ],
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 500);
  });

  it('infers process from items[] without q/a or date/headline', async () => {
    const rich = buildSeedFiles({
      title: 'Steps',
      items: [
        { num: '01', title: 'Sign up', desc: 'Free tier.' },
        { num: '02', title: 'Install', desc: 'One command.' },
      ],
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 400);
  });

  it('infers process from steps[] (alternate name)', async () => {
    const rich = buildSeedFiles({
      title: 'Steps',
      steps: [
        { num: '01', title: 'Sign up', desc: 'Free tier.' },
        { num: '02', title: 'Install', desc: 'One command.' },
      ],
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 400);
  });

  it('infers comparison from left_items[] + right_items[]', async () => {
    const rich = buildSeedFiles({
      title: 'Us vs them',
      left_header: 'Them',
      right_header: 'Us',
      left_items: ['Manual', 'Slow', 'Expensive'],
      right_items: ['Automated', '60s', 'Per-GB'],
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 500);
  });

  it('infers testimonial from quote + role/company', async () => {
    const rich = buildSeedFiles({
      title: 'Testimonial',
      quote: 'Folio made the new identity feel inevitable.',
      author: 'Daniela Ortiz',
      role: 'Director',
      company: 'Casa Moderno',
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 400);
  });

  it('infers quote from quote alone (no role/company)', async () => {
    const rich = buildSeedFiles({
      title: 'Quote',
      quote: 'The starter kit replaced three things I had been over-paying for.',
      author: 'Tomás',
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 300);
  });

  it('infers image-text from image data URI', async () => {
    const dataUri =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAfbLI3wAAAABJRU5ErkJggg==';
    const rich = buildSeedFiles({
      title: 'Picture story',
      body: 'Caption.',
      image: dataUri,
      layout: 'left',
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 1000);
  });

  it('infers stats from stat_N_* indexed fields (no array)', async () => {
    const rich = buildSeedFiles({
      title: 'Stats',
      stat_1_value: '1,240', stat_1_label: 'scholarships funded',
      stat_2_value: '37', stat_2_label: 'partner schools',
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 400);
  });

  it('infers features from feature_N_* indexed fields (no array)', async () => {
    const rich = buildSeedFiles({
      title: 'Features',
      feature_1_title: 'Plain text', feature_1_desc: 'Markdown in.',
      feature_2_title: 'Local-first', feature_2_desc: 'Your data.',
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 400);
  });

  it('infers problem from pain_N_* indexed fields (no array)', async () => {
    const rich = buildSeedFiles({
      title: 'Problem',
      body: 'Apps stall.',
      pain_1_title: 'Bloat', pain_1_body: '50 plus features.',
      pain_2_title: 'Drama', pain_2_body: 'Streaks.',
    });
    const bare = buildSeedFiles({ title: 'T' });
    const [richBytes, bareBytes] = await Promise.all([
      buildPptxPresentation({ files: rich, projectName: 'R' }),
      buildPptxPresentation({ files: bare, projectName: 'B' }),
    ]);
    expect(richBytes.byteLength).toBeGreaterThan(bareBytes.byteLength + 300);
  });

  it('a real seed-bundle data.json renders rich content for every slide', async () => {
    // End-to-end: the actual annual-report seed data.json has 6
    // slides, 2 of which carry `stats[]` under stems
    // `slide-02-by-the-numbers` and `slide-04-outcomes`. Without
    // data-shape inference those slides collapsed to a generic
    // title+body. With it, each stat tile renders and the deck
    // exceeds the byte count of a single bare cover.
    const seedDataJson = JSON.stringify({
      _meta: { project: 'Atlas Foundation — 2025 impact report' },
      slides: [
        { stem: 'slide-01-cover', data: { title: 'Atlas Foundation', subtitle: '2025 impact at a glance' } },
        {
          stem: 'slide-02-by-the-numbers',
          data: {
            eyebrow: 'By the numbers',
            title: 'What 2025 looked like',
            stats: [
              { value: '1,240', label: 'scholarships funded' },
              { value: '37', label: 'partner schools' },
              { value: '$4.8M', label: 'disbursed in grants' },
              { value: '92%', label: 'still enrolled' },
            ],
          },
        },
        { stem: 'slide-03-where', data: { title: '37 schools across 4 regions', body: 'Atlas concentrates…' } },
        {
          stem: 'slide-04-outcomes',
          data: {
            eyebrow: 'Outcomes',
            title: 'The numbers that matter most',
            stats: [
              { value: '78%', label: 'finish secondary' },
              { value: '31%', label: 'go on to tertiary' },
              { value: '1.4x', label: 'earnings uplift' },
            ],
          },
        },
        { stem: 'slide-05-finance', data: { title: 'Every dollar accounted for', body: '86¢ to scholars.' } },
        { stem: 'slide-06-thanks', data: { title: 'To our 1,800 donors', body: 'Thank you.' } },
      ],
    });
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: ':root{--mgf-color-bg:#FBF7EE;--mgf-color-accent:#FF3DAA;--mgf-color-text-primary:#0A0A0A;}' }),
      file({ layer: 'content', name: 'data.json', content: seedDataJson }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'Atlas' });
    // 6 slides × multiple text/shape elements each must clear 8KB.
    // Pre-fix this was ~3KB because only the title was rendered.
    expect(bytes.byteLength).toBeGreaterThan(8000);
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

  it('still classifies <h1 class="mgf-title-xl" data-field="title"> as cover', () => {
    // The actual cover-slide shape: an <h1> with data-field="title"
    // and the `mgf-title-xl` class. Cover is now identified by the
    // <h1> tag alone — the class is not used in the regex because
    // closing/ask slides also use `mgf-title-xl`.
    expect(
      identifyComponent('<h1 class="mgf-title-xl" data-field="title">Project</h1>'),
    ).toBe('cover');
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

  it('does NOT classify the seeded problem slide shape (<h2 class="mgf-title-lg">) as cover', () => {
    // Regression: the previous "fix" swapped `mgf-eyebrow` for
    // `mgf-title-xl|mgf-title-lg` in the cover regex. `mgf-title-lg`
    // is used on EVERY non-cover slide for its main title — see
    // `slideProblem()`, `slideFeatures()`, `slideStats()`,
    // `slideStatsThreeUp()` in MgfFileBuilders. With the broad
    // match, every non-cover slide still routed to renderCover and
    // lost its body and bullet points. This test mirrors the exact
    // seeded HTML for slide-02.
    expect(
      identifyComponent(
        '<section class="mgf-slide">' +
          '<p class="mgf-eyebrow">The Problem</p>' +
          '<div class="mgf-accent-bar mgf-mt-sm"></div>' +
          '<h2 class="mgf-title-lg mgf-mt-md" data-field="title">Problem title</h2>' +
          '<p class="mgf-body mgf-mt-md" data-field="body">Body text.</p>' +
          '<ul class="mgf-list mgf-mt-lg" data-field="points">' +
          '<li>First point</li><li>Second point</li><li>Third point</li>' +
          '</ul>' +
          '<p class="mgf-slide-number" data-field="id">02</p>' +
          '</section>',
      ),
    ).not.toBe('cover');
  });

  it('does NOT classify the seeded features slide shape as cover', () => {
    // Same root cause — features uses `<h2 class="mgf-title-lg">` for
    // its title plus `mgf-grid-3` + `mgf-card` for the grid. The
    // `mgf-grid-3.*mgf-card` pattern should still match first, but
    // without it the cover regex would steal the classification.
    expect(
      identifyComponent(
        '<section class="mgf-slide">' +
          '<p class="mgf-eyebrow">The Solution</p>' +
          '<h2 class="mgf-title-lg mgf-mt-md" data-field="title">Solution title</h2>' +
          '<div class="mgf-grid-3 mgf-mt-lg" data-field="features">' +
          '<div class="mgf-card"><div class="mgf-feature-icon">⚡</div></div>' +
          '<div class="mgf-card"><div class="mgf-feature-icon">🔗</div></div>' +
          '<div class="mgf-card"><div class="mgf-feature-icon">📊</div></div>' +
          '</div>' +
          '</section>',
      ),
    ).toBe('features');
  });

  it('does NOT classify <h2 class="mgf-title-xl"> closing/ask shape as cover', () => {
    // Regression: closing/ask slides use <h2 class="mgf-title-xl">
    // for a hero-style title (see slideClosing, slideArabicAsk,
    // slideArabicClosing, slideEarthAsk, slideEarthClosing in
    // MgfFileBuilders). The cover regex used to match the class and
    // route them to renderCover, silently dropping body, cta, cta_url,
    // footer. The cover regex now keys on <h1> alone.
    expect(
      identifyComponent(
        '<section class="mgf-slide">' +
          '<p class="mgf-eyebrow">The Ask</p>' +
          '<div class="mgf-accent-bar mgf-mt-sm"></div>' +
          '<h2 class="mgf-title-xl mgf-mt-md" data-field="title">Raising $XM</h2>' +
          '<p class="mgf-subtitle mgf-mt-md" data-field="body">Use-of-funds paragraph.</p>' +
          '<p class="mgf-slide-number" data-field="id">10</p>' +
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

describe('buildPptxPresentation — data.json vs HTML component disagreement', () => {
  // Regression: PPTX previously trusted `data.json.slides[].component`
  // *first*, so a project whose data.json was overwritten without
  // updating per-slide components (e.g. every entry stuck on
  // `component: "cover"`) routed every slide to `renderCover` and
  // silently dropped body/bullets/points. The fix prefers the
  // HTML-detected component and warns on disagreement so the user
  // can repair the persisted data.json.
  it('prefers HTML-detected component when data.json disagrees (and warns)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const files: ProjectFile[] = [
        file({ layer: 'style', name: 'style.css', content: ':root{--mgf-color-bg:#0b0f17;--mgf-color-accent:#22d3ee;}' }),
        file({
          layer: 'content',
          name: 'data.json',
          content: JSON.stringify({
            slides: [{
              id: 1,
              // The bug: data.json says "cover" but HTML is a
              // features slide. Before the fix this routed to
              // renderCover and dropped the grid.
              component: 'cover',
              data: { title: 'Cover-ish title' },
            }],
          }),
        }),
        file({
          layer: 'slide',
          name: 'slide-01.html',
          content:
            '<section class="mgf-slide">' +
            '<h2 class="mgf-title-lg mgf-mt-md" data-field="title">Features title</h2>' +
            '<div class="mgf-grid-3 mgf-mt-lg" data-field="features">' +
            '<div class="mgf-card">A</div>' +
            '<div class="mgf-card">B</div>' +
            '<div class="mgf-card">C</div>' +
            '</div>' +
            '</section>',
        }),
      ];
      const bytes = await buildPptxPresentation({ files, projectName: 'Disagree' });
      expect(bytes.byteLength).toBeGreaterThan(2000);
      // The disagreement warning must have fired with both names.
      const calls = warnSpy.mock.calls.map((c) => c.join(' ')).join('\n');
      expect(calls).toContain('data.json component "cover"');
      expect(calls).toContain('HTML-detected "features"');
      expect(calls).toContain('slide-01.html');
    } finally {
      warnSpy.mockRestore();
    }
  });

  it('does NOT warn when data.json component matches HTML', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const files: ProjectFile[] = [
        file({ layer: 'style', name: 'style.css', content: ':root{--mgf-color-bg:#0b0f17;}' }),
        file({
          layer: 'content',
          name: 'data.json',
          content: JSON.stringify({
            slides: [{
              id: 1,
              component: 'features',
              data: { title: 'T' },
            }],
          }),
        }),
        file({
          layer: 'slide',
          name: 'slide-01.html',
          content:
            '<div class="mgf-grid-3">' +
            '<div class="mgf-card">A</div>' +
            '<div class="mgf-card">B</div>' +
            '<div class="mgf-card">C</div>' +
            '</div>',
        }),
      ];
      await buildPptxPresentation({ files, projectName: 'Agree' });
      const disagreeCalls = warnSpy.mock.calls.filter((c) =>
        c.some((arg) => typeof arg === 'string' && arg.includes('data.json component')),
      );
      expect(disagreeCalls).toHaveLength(0);
    } finally {
      warnSpy.mockRestore();
    }
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

// ─────────────────────────────────────────────────────────────────────────
// Tier 1B — extended archetype coverage
//
// Each block below exercises one of the ten renderers added on top of
// the original 15. Tests check that the build succeeds (no throw),
// emits a valid PPTX, and that the slide XML carries the supplied
// content (so we know the renderer actually used the data instead of
// dropping it).
// ─────────────────────────────────────────────────────────────────────────

describe('buildPptxPresentation — extended archetypes (Tier 1B)', () => {
  const STYLE_CSS = ':root{--mgf-color-bg:#0b0f17;--mgf-color-accent:#22d3ee;--mgf-color-text-primary:#f4f6fa;--mgf-color-text-secondary:#94a3b8;--mgf-color-surface:#0f1218;--mgf-color-surface-2:#1a1f2b;--mgf-color-border:#1e2535;--mgf-font-display:"Calibri";--mgf-font-body:"Calibri";--mgf-font-mono:"Consolas";}';

  it('renders hero with eyebrow + title + sub + cta', async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({
        layer: 'content',
        name: 'data.json',
        content: JSON.stringify({
          slides: [
            {
              stem: 'slide-01-hero',
              data: {
                eyebrow: 'INTRODUCTION',
                title: 'Welcome to MGF',
                subtitle: 'A modular AI content generator',
                primary_cta: 'Get started',
                secondary_cta: 'Learn more',
              },
            },
          ],
        }),
      }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'Hero' });
    expect(bytes.byteLength).toBeGreaterThan(1000);
    // Verify the title actually lands on a slide.
    const zip = await JSZip.loadAsync(bytes);
    const slide1 = await zip.file('ppt/slides/slide1.xml')?.async('string');
    expect(slide1).toContain('Welcome to MGF');
    expect(slide1).toContain('GET STARTED');
  });

  it('renders section header with eyebrow + title + sub', async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({
        layer: 'content',
        name: 'data.json',
        content: JSON.stringify({
          slides: [
            {
              stem: 'slide-02-section',
              data: {
                eyebrow: 'CHAPTER 3',
                title: 'Implementation',
                subtitle: 'How the system works in practice',
              },
            },
          ],
        }),
      }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'S' });
    const zip = await JSZip.loadAsync(bytes);
    const slide1 = await zip.file('ppt/slides/slide1.xml')?.async('string');
    expect(slide1).toContain('CHAPTER 3');
    expect(slide1).toContain('Implementation');
  });

  it('renders callout with title + body + variant color', async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({
        layer: 'content',
        name: 'data.json',
        content: JSON.stringify({
          slides: [
            {
              stem: 'slide-03-callout',
              data: {
                title: 'Heads up',
                body: 'This is an important warning about the data.',
                variant: 'warning',
                icon: '⚠',
              },
            },
          ],
        }),
      }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'C' });
    const zip = await JSZip.loadAsync(bytes);
    const slide1 = await zip.file('ppt/slides/slide1.xml')?.async('string');
    expect(slide1).toContain('Heads up');
    expect(slide1).toContain('warning');
  });

  it('renders badge row from badges[]', async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({
        layer: 'content',
        name: 'data.json',
        content: JSON.stringify({
          slides: [
            {
              stem: 'slide-04-badges',
              data: {
                badges: [
                  { text: 'NEW', variant: 'accent' },
                  { text: 'BETA', variant: 'default' },
                ],
              },
            },
          ],
        }),
      }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'B' });
    const zip = await JSZip.loadAsync(bytes);
    const slide1 = await zip.file('ppt/slides/slide1.xml')?.async('string');
    expect(slide1).toContain('NEW');
    expect(slide1).toContain('BETA');
  });

  it('renders code card with filename + language + body', async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({
        layer: 'content',
        name: 'data.json',
        content: JSON.stringify({
          slides: [
            {
              stem: 'slide-05-code',
              data: {
                title: 'Configuration',
                filename: 'app.config.ts',
                lang: 'ts',
                code: 'export default { enabled: true };',
              },
            },
          ],
        }),
      }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'K' });
    const zip = await JSZip.loadAsync(bytes);
    const slide1 = await zip.file('ppt/slides/slide1.xml')?.async('string');
    expect(slide1).toContain('app.config.ts');
    expect(slide1).toContain('export default');
  });

  it('renders KPI with value + label', async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({
        layer: 'content',
        name: 'data.json',
        content: JSON.stringify({
          slides: [
            {
              stem: 'slide-06-kpi',
              data: {
                eyebrow: 'TODAY',
                value: '$1.2M',
                label: 'Revenue',
              },
            },
          ],
        }),
      }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'KPI' });
    const zip = await JSZip.loadAsync(bytes);
    const slide1 = await zip.file('ppt/slides/slide1.xml')?.async('string');
    expect(slide1).toContain('$1.2M');
    expect(slide1).toContain('REVENUE');
  });

  it('renders vertical bar chart from bars[]', async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({
        layer: 'content',
        name: 'data.json',
        content: JSON.stringify({
          slides: [
            {
              stem: 'slide-07-bar',
              data: {
                title: 'Q1 performance',
                bars: [
                  { label: 'Jan', value: 30 },
                  { label: 'Feb', value: 45 },
                  { label: 'Mar', value: 80 },
                ],
              },
            },
          ],
        }),
      }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'BC' });
    const zip = await JSZip.loadAsync(bytes);
    const slide1 = await zip.file('ppt/slides/slide1.xml')?.async('string');
    expect(slide1).toContain('Q1 performance');
    // Each label appears as a category caption below its bar.
    expect(slide1).toContain('Jan');
    expect(slide1).toContain('Feb');
    expect(slide1).toContain('Mar');
  });

  it('renders horizontal bar chart from rows[]', async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({
        layer: 'content',
        name: 'data.json',
        content: JSON.stringify({
          slides: [
            {
              stem: 'slide-08-hbar',
              data: {
                title: 'Engagement by channel',
                rows: [
                  { label: 'Email', value: 80 },
                  { label: 'Twitter', value: 45 },
                  { label: 'LinkedIn', value: 95 },
                ],
              },
            },
          ],
        }),
      }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'HBC' });
    const zip = await JSZip.loadAsync(bytes);
    const slide1 = await zip.file('ppt/slides/slide1.xml')?.async('string');
    expect(slide1).toContain('Engagement by channel');
    expect(slide1).toContain('Email');
  });

  it('renders nav with brand + links', async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({
        layer: 'content',
        name: 'data.json',
        content: JSON.stringify({
          slides: [
            {
              stem: 'slide-09-nav',
              data: {
                brand: 'MGF',
                links: ['Docs', 'Pricing', 'Contact'],
                body: 'Main landing area below the navigation.',
              },
            },
          ],
        }),
      }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'N' });
    const zip = await JSZip.loadAsync(bytes);
    const slide1 = await zip.file('ppt/slides/slide1.xml')?.async('string');
    expect(slide1).toContain('MGF');
    expect(slide1).toContain('Docs');
    expect(slide1).toContain('Pricing');
    expect(slide1).toContain('Contact');
  });

  it('renders footer with centered text + links', async () => {
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({
        layer: 'content',
        name: 'data.json',
        content: JSON.stringify({
          slides: [
            {
              stem: 'slide-10-footer',
              data: {
                body: 'Page body content above the footer.',
                text: '© 2026 MGF',
                links: ['Twitter', 'GitHub', 'Email'],
              },
            },
          ],
        }),
      }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'F' });
    const zip = await JSZip.loadAsync(bytes);
    const slide1 = await zip.file('ppt/slides/slide1.xml')?.async('string');
    expect(slide1).toContain('2026 MGF');
    expect(slide1).toContain('Twitter');
  });

  it('routes an unknown seed stem via data-shape inference (covers Tier-1B shapes)', async () => {
    // A "slide-02-hero" stem isn't a registered component — the
    // dispatcher falls back to data-shape inference, which now picks
    // `hero` because the payload carries `primary_cta` + `subtitle`.
    const files: ProjectFile[] = [
      file({ layer: 'style', name: 'style.css', content: STYLE_CSS }),
      file({
        layer: 'content',
        name: 'data.json',
        content: JSON.stringify({
          slides: [
            {
              stem: 'slide-02-hero',
              data: {
                title: 'Inferred hero',
                subtitle: 'Picked up by inferComponentFromData',
                primary_cta: 'Continue',
              },
            },
          ],
        }),
      }),
    ];
    const bytes = await buildPptxPresentation({ files, projectName: 'Inf' });
    const zip = await JSZip.loadAsync(bytes);
    const slide1 = await zip.file('ppt/slides/slide1.xml')?.async('string');
    // Hero renderer should have emitted the title, sub, and CTA.
    expect(slide1).toContain('Inferred hero');
    expect(slide1).toContain('CONTINUE');
  });
});
