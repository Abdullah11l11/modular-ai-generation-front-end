import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/**
 * Section 1 of `/docs` — the page's hero.
 *
 * Mirrors `src/pages/landing/components/Hero.tsx` in structure but the
 * right column is a three-layer stack tinted with the project's
 * pre-defined layer accent tokens (cyan / purple / orange), so the
 * page communicates its central metaphor at first glance.
 */
export function PhilosophyHero() {
  return (
    <section
      aria-labelledby="docs-hero-heading"
      className="relative overflow-hidden pb-[30px] pt-[30px]"
    >
      {/* Decorative cyan glow — same recipe as the landing Hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--cy) opacity-[0.08] blur-3xl md:size-[640px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-(--bor) to-transparent"
      />

      <div className="mx-auto grid max-w-(--container-main) gap-10 px-(--space-page-x) lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-(--bor2)/60 bg-(--sur)/60 px-3 py-1 font-(--font-mono) text-[11px] tracking-wider text-(--t2) uppercase backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-(--cy)" />
            The modular philosophy
          </div>

          <h1
            id="docs-hero-heading"
            className="text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] font-extrabold tracking-tight text-(--t1)"
          >
            Build anything by composing layers, not writing code.
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-(--t2) md:text-lg">
            One brief lands. The framework splits intent into independent
            layers — structure, style, content — and every layer speaks
            through the same standard tokens. The pieces snap together
            into a finished deck, dashboard, site, or anything that
            needs composing.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button asChild variant="accent" size="lg">
              <Link to="/projects/new/ai">Start composing →</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/templates">Browse templates</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 font-(--font-mono) text-[11px] tracking-wider text-(--t3) uppercase">
            <span className="text-(--t2)">6 sections · 2 min read</span>
            <span>·</span>
            <span className="text-(--t2)">public, no sign-in needed</span>
          </div>
        </div>

        {/* Layered stack — three rotated card mocks in the three layer
            accent colors. Communicates the central metaphor at first
            glance: structure (cyan), style (purple), content (orange). */}
        <LayeredStack />
      </div>
    </section>
  );
}

function LayeredStack() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[460px]">
      <div className="absolute -top-8 -right-6 -z-10 size-40 rounded-full bg-(--cy) opacity-10 blur-2xl" />
      <div className="absolute -bottom-10 -left-8 -z-10 size-44 rounded-full bg-(--cy) opacity-[0.06] blur-2xl" />

      <div className="space-y-4">
        {LAYERS.map((layer, i) => (
          <div
            key={layer.name}
            className={`relative rounded-(--radius-card) border bg-(--sur) p-5 shadow-md transition-transform ${
              i === 0
                ? 'translate-x-2 -rotate-1'
                : i === 1
                  ? 'translate-x-0 rotate-0'
                  : '-translate-x-2 rotate-1'
            }`}
            style={{ borderColor: `color-mix(in srgb, ${layer.color} 45%, var(--bor2))` }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase">
                Layer {i + 1}
              </span>
              <span className="size-1.5 rounded-full" style={{ background: layer.color }} />
            </div>
            <div className="font-(--font-mono) text-[11px] tracking-wider uppercase" style={{ color: layer.color }}>
              {layer.name}
            </div>
            <div className="mt-1 text-base font-semibold text-(--t1)">{layer.title}</div>
            <div className="mt-1 text-xs text-(--t2)">{layer.role}</div>
            <div className="mt-4 flex items-center gap-1.5">
              <div className="h-1 w-12 rounded-full" style={{ background: layer.color }} />
              <div className="h-1 w-6 rounded-full bg-(--bor2)" />
              <div className="h-1 w-3 rounded-full bg-(--bor2)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const LAYERS = [
  {
    name: 'structure',
    title: 'What goes where',
    role: 'Layouts, grids, sections',
    // var(--layer-structure) = var(--cy) = #09b8c4
    color: 'var(--layer-structure)',
  },
  {
    name: 'style',
    title: 'How it looks',
    role: 'Tokens, surfaces, type',
    // var(--layer-style) = #6d28d9
    color: 'var(--layer-style)',
  },
  {
    name: 'content',
    title: 'What it says',
    role: 'Copy, data, media',
    // var(--layer-content) = #d97706
    color: 'var(--layer-content)',
  },
] as const;