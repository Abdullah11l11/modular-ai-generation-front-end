import { Reveal } from '@/components/reveal';

/**
 * Section 2 of `/docs` — "One message. Three layers."
 *
 * Left column: a stylized "brief" card with sample brief copy.
 * Right column: three layer cards (structure / style / content),
 * each tinted with its layer accent color.
 *
 * On wide screens a thin connector line visually links the brief to
 * the three layers. Stagger the three layer cards with `delayMs`
 * inside `<Reveal>` for a soft cascade on first reveal.
 */
export function LayersFlow() {
  return (
    <section
      aria-labelledby="docs-flow-heading"
      className="relative border-t border-(--bor2)/40 py-[30px]"
    >
      <div className="mx-auto max-w-(--container-main) px-(--space-page-x)">
        <Reveal>
          <p className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
            01 / From one brief
          </p>
          <h2
            id="docs-flow-heading"
            className="mt-3 max-w-3xl text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-bold tracking-tight text-(--t1)"
          >
            One message. Three layers.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-(--t2)">
            You write one brief. The framework partitions intent into
            orthogonal layers — structure, style, content — so each can
            be re-skinned or re-written without disturbing the others.
            The brief is sent once; the layers are independent forever.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-12">
          {/* Left — the brief. */}
          <Reveal delayMs={80}>
            <div className="relative">
              <BriefCard />
            </div>
          </Reveal>

          {/* Right — three layer cards. */}
          <div className="space-y-4">
            {LAYERS.map((layer, i) => (
              <Reveal key={layer.name} delayMs={140 + i * 80}>
                <LayerRow layer={layer} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BriefCard() {
  return (
    <div className="relative rounded-(--radius-card) border border-(--bor2)/40 bg-(--sur) p-5 shadow-sm ring-1 ring-(--bor2)/50 transition-all duration-150 hover:-translate-y-px hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase">
          brief · in
        </span>
        <span className="size-1.5 rounded-full bg-(--cy)" />
      </div>
      <p className="text-sm leading-relaxed text-(--t1)">
        “Series A pitch deck for a clean-energy startup. 8 slides, dark
        tone, headline numbers, one chart per slide. Founder photo and a
        product screenshot.”
      </p>
      <div className="mt-4 flex items-center gap-1.5">
        <div className="h-1 w-12 rounded-full bg-(--cy)" />
        <div className="h-1 w-6 rounded-full bg-(--bor2)" />
        <div className="h-1 w-3 rounded-full bg-(--bor2)" />
      </div>
      <p className="mt-4 font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase">
        one message → three layers
      </p>
    </div>
  );
}

type Layer = {
  name: string;
  title: string;
  role: string;
  color: string;
  cssVar: string;
};

const LAYERS: Layer[] = [
  {
    name: 'structure',
    title: 'What goes where',
    role: 'Layouts, grids, sections, ordering',
    color: 'var(--layer-structure)',
    cssVar: '--layer-structure',
  },
  {
    name: 'style',
    title: 'How it looks',
    role: 'Tokens, surfaces, typography, motion',
    color: 'var(--layer-style)',
    cssVar: '--layer-style',
  },
  {
    name: 'content',
    title: 'What it says',
    role: 'Copy, data, media, citations',
    color: 'var(--layer-content)',
    cssVar: '--layer-content',
  },
];

function LayerRow({ layer }: { layer: Layer }) {
  return (
    <div
      className="relative flex items-center gap-4 rounded-(--radius-card) border border-(--bor2)/40 bg-(--sur) p-4 shadow-sm ring-1 ring-(--bor2)/50 transition-all duration-150 hover:-translate-y-px hover:shadow-md"
      style={{ borderLeftWidth: '3px', borderLeftColor: layer.color }}
    >
      <div
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-lg"
        style={{ background: `color-mix(in srgb, ${layer.color} 14%, transparent)` }}
      >
        <span className="size-2 rounded-full" style={{ background: layer.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-(--font-mono) text-[11px] tracking-wider uppercase" style={{ color: layer.color }}>
          {layer.name}
        </div>
        <div className="text-sm font-semibold text-(--t1)">{layer.title}</div>
        <div className="text-xs text-(--t2)">{layer.role}</div>
      </div>
      <div className="hidden shrink-0 text-right font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase sm:block">
        <div style={{ color: layer.color }}>layer {`{${layer.name}}`}</div>
        <div>{layer.cssVar}</div>
      </div>
    </div>
  );
}