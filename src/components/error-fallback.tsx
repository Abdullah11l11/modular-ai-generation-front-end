import { Button } from '@/components/ui/button';

type ErrorFallbackProps = {
  error?: Error;
  reset?: () => void;
};

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[60vh] flex-col w-screen items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-(--cy-d) text-(--cy)">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-sm font-semibold text-(--t1)">Something went wrong</h2>
      <p className="max-w-xs text-xs text-(--t2)">
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </p>
      {reset && (
        <Button variant="outline" size="sm" onClick={reset}>
          Try again
        </Button>
      )}
    </div>
  );
}
