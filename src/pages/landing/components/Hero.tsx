import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';

const NAV_LINKS = [
  { label: 'Templates', to: '/templates' },
  { label: 'Resources', to: '/resources' },
];

/**
 * Hero section of the marketing landing page.
 *
 * - Headline + sub communicate the product (decks / dashboards / sites)
 *   and the value (AI brief → styled output, no CSS required).
 * - Two CTAs swap copy based on auth state — visitors see "Get started"
 *   and "Sign in"; authenticated users see "Open dashboard" and
 *   "Generate with AI" so they jump straight to the most useful action.
 * - The right column is a stylized preview tile (a 3-slide stack mock)
 *   rather than a real screenshot — keeps the page light and avoids
 *   hard-coding a hero image that would go stale.
 */
export function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden pb-24 pt-16 md:pb-32 md:pt-24"
    >
      {/* Accent glow behind the hero — uses the app's cyan token at
          low opacity so it stays on-theme without introducing new colors. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--cy) opacity-[0.08] blur-3xl md:size-[640px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-(--bor) to-transparent"
      />

      <div className="mx-auto grid max-w-(--container-main) gap-12 px-(--space-page-x) lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-(--bor2)/60 bg-(--sur)/60 px-3 py-1 font-(--font-mono) text-[11px] tracking-wider text-(--t2) uppercase backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-(--cy)" />
            Modular Generation Framework
          </div>

          <h1
            id="hero-heading"
            className="text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] font-extrabold tracking-tight text-(--t1)"
          >
            Build presentations, dashboards, and sites with AI.
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-(--t2) md:text-lg">
            Separate structure, style, and content. Ship decks, dashboards, and one-pagers in
            minutes — start from a template or generate from a brief.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button asChild variant="accent" size="lg">
                  <Link to="/dashboard">Open dashboard</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/projects/new/ai">Generate with AI</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="accent" size="lg">
                  <Link to="/register">Get started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 font-(--font-mono) text-[11px] tracking-wider text-(--t3) uppercase">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="text-(--t2) no-underline hover:text-(--cy)">
                {l.label} →
              </Link>
            ))}
            <span className="text-(--t3)">· no credit card required</span>
          </div>
        </div>

        {/* Stylized preview tile — three stacked slides suggest the
            product without committing to a screenshot. */}
        <PreviewTile />
      </div>
    </section>
  );
}

function PreviewTile() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[460px]">
      <div className="absolute -top-8 -right-6 -z-10 size-40 rounded-full bg-(--cy) opacity-10 blur-2xl" />
      <div className="absolute -bottom-10 -left-8 -z-10 size-44 rounded-full bg-(--cy) opacity-[0.06] blur-2xl" />

      <div className="space-y-4">
        {[
          { tone: 'first', title: 'Series A · Q2 2026', sub: 'Lumen AI' },
          { tone: 'second', title: 'Traction & milestones', sub: '142% MoM growth' },
          { tone: 'third', title: 'The ask', sub: '$12M Series A' },
        ].map((slide, i) => (
          <div
            key={slide.title}
            className={`relative rounded-(--radius-card) border border-(--bor2)/50 bg-(--sur) p-5 shadow-md transition-transform ${
              i === 0
                ? 'translate-x-2 -rotate-1'
                : i === 1
                  ? 'translate-x-0 rotate-0'
                  : '-translate-x-2 rotate-1'
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase">
                Slide {i + 1}
              </span>
              <span className="size-1.5 rounded-full bg-(--cy)" />
            </div>
            <div className="text-base font-semibold text-(--t1)">{slide.title}</div>
            <div className="mt-1 text-xs text-(--t2)">{slide.sub}</div>
            <div className="mt-4 flex items-center gap-1.5">
              <div className="h-1 w-12 rounded-full bg-(--cy)" />
              <div className="h-1 w-6 rounded-full bg-(--bor2)" />
              <div className="h-1 w-3 rounded-full bg-(--bor2)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}