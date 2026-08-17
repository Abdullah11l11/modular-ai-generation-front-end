import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * Bottom-of-page call-to-action band. Same auth-aware copy swap as the
 * hero so a returning user isn't forced through `/register`.
 */
export function FinalCTA() {
  const { isAuthenticated } = useAuth();

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden border-t border-(--bor2)/40 py-[30px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--cy) opacity-[0.07] blur-3xl"
      />

      <div className="mx-auto max-w-(--container-main) px-(--space-page-x) text-center">
        <span className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
          03 / Ship it
        </span>
        <h2
          id="final-cta-heading"
          className="mx-auto mt-3 max-w-2xl text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.1] font-bold tracking-tight text-(--t1)"
        >
          Ready to ship?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-(--t2)">
          Generate a project in under a minute. No credit card, no setup — just describe what you
          want and the AI takes it from there.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated ? (
            <>
              <Button asChild variant="accent" size="lg">
                <Link to="/projects/new/ai">Generate with AI</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/templates">Browse templates</Link>
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
      </div>
    </section>
  );
}