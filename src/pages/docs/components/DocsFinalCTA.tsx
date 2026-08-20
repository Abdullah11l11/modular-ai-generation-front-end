import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';

/**
 * Section 6 of `/docs` — final call-to-action.
 *
 * Mirrors `src/pages/landing/components/FinalCTA.tsx` but with
 * docs-flavoured copy. Public page — no auth-swap needed because both
 * destinations (`/projects/new/ai` and `/templates`) handle their own
 * auth gating.
 */
export function DocsFinalCTA() {
  return (
    <section
      aria-labelledby="docs-final-cta-heading"
      className="relative border-t border-(--bor2)/40 py-[30px]"
    >
      {/* Decorative cyan glow — same recipe as landing FinalCTA. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--cy) opacity-[0.07] blur-3xl"
      />

      <div className="mx-auto max-w-(--container-main) px-(--space-page-x)">
        <Reveal>
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <p className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
              05 / Ship it
            </p>
            <h2
              id="docs-final-cta-heading"
              className="mt-3 text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.1] font-bold tracking-tight text-(--t1)"
            >
              Compose your first layer.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-(--t2)">
              Start from a brief and let the framework split it into
              layers. Or fork a template and re-skin it with three
              tokens. Either way, the vocabulary is the same.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="accent" size="lg">
                <Link to="/projects/new/ai">Generate with AI</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/templates">Browse templates</Link>
              </Button>
            </div>
            <p className="mt-6 font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase">
              same vocabulary · same tokens · any medium
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}