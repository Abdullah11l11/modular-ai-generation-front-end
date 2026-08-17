import { Link } from 'react-router-dom';
import { useTemplates } from '@/features/templates/hooks/useTemplates';
import { TemplateCard } from '@/features/templates/components/TemplateCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

/**
 * "Top 3 templates by upvotes" — public endpoint, no auth required.
 * Reuses the existing `<TemplateCard />` so the visual matches the rest
 * of the app (live first-slide preview, author avatar, upvote count).
 */
export function FeaturedTemplates() {
  const { data, isLoading, isError } = useTemplates({
    sort: 'popular',
    per_page: 3,
    page: 1,
  });

  const templates = data?.data ?? [];

  return (
    <section
      aria-labelledby="featured-templates-heading"
      className="border-t border-(--bor2)/40 py-24 md:py-32"
    >
      <div className="mx-auto max-w-(--container-main) px-(--space-page-x)">
        <div className="mb-10 flex items-end justify-between gap-4 md:mb-14">
          <div className="space-y-2">
            <span className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
              01 / Featured templates
            </span>
            <h2
              id="featured-templates-heading"
              className="text-[clamp(1.5rem,2.5vw,2.25rem)] leading-tight font-bold tracking-tight text-(--t1)"
            >
              Start from a community deck.
            </h2>
            <p className="max-w-lg text-sm text-(--t2)">
              The three most upvoted public templates. Fork any of them into your own project in one
              click.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/templates">Browse all →</Link>
          </Button>
        </div>

        {isLoading && <FeaturedTemplatesSkeleton />}

        {isError && (
          <p className="text-sm text-(--t3)">
            Couldn't load templates right now. <Link to="/templates" className="text-(--cy) hover:underline">Browse the catalogue</Link>.
          </p>
        )}

        {!isLoading && !isError && templates.length === 0 && (
          <p className="text-sm text-(--t3)">
            No public templates yet.{' '}
            <Link to="/templates" className="text-(--cy) hover:underline">
              Be the first to publish one
            </Link>
            .
          </p>
        )}

        {!isLoading && !isError && templates.length > 0 && (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <li key={template.id}>
                <TemplateCard template={template} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 sm:hidden">
          <Button asChild variant="outline" size="sm">
            <Link to="/templates">Browse all →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FeaturedTemplatesSkeleton() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading featured templates">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="overflow-hidden rounded-(--radius-card) border border-(--bor2)/40 bg-(--sur)"
        >
          <Skeleton className="aspect-video w-full" />
          <div className="space-y-2 p-(--space-card-pad)">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </li>
      ))}
    </ul>
  );
}