import { Link } from 'react-router-dom';
import { useResources } from '@/features/resources/hooks/useResources';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Resource } from '@/types/api';

const KIND_LABELS: Record<Resource['kind'], string> = {
  prompt: 'Prompt',
  skill: 'Skill',
  agent: 'Agent',
  rule: 'Rule',
  mcp: 'MCP',
  design_doc: 'Design Doc',
  hook: 'Hook',
};

/**
 * "Top 3 resources by upvotes". Resources have no thumbnail, so the
 * card is text-only with a large kind badge as the visual hook. Card
 * matches the patterns used on the existing `/resources` list page so
 * users recognize what they're clicking into.
 */
export function FeaturedResources() {
  const { data, isLoading, isError } = useResources({
    sort: 'popular',
    per_page: 3,
    page: 1,
  });

  const resources = data?.data ?? [];

  return (
    <section
      aria-labelledby="featured-resources-heading"
      className="border-t border-(--bor2)/40 bg-gradient-to-b from-transparent via-(--sur2)/30 to-transparent py-[30px]"
    >
      <div className="mx-auto max-w-(--container-main) px-(--space-page-x)">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
              02 / Featured resources
            </span>
            <h2
              id="featured-resources-heading"
              className="text-[clamp(1.5rem,2.5vw,2.25rem)] leading-tight font-bold tracking-tight text-(--t1)"
            >
              Reusable prompts, skills, and rules.
            </h2>
            <p className="max-w-lg text-sm text-(--t2)">
              Community-shared building blocks. Wire them into your own projects to ship faster.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/resources">Browse all →</Link>
          </Button>
        </div>

        {isLoading && <FeaturedResourcesSkeleton />}

        {isError && (
          <p className="text-sm text-(--t3)">
            Couldn't load resources right now.{' '}
            <Link to="/resources" className="text-(--cy) hover:underline">
              Browse the catalogue
            </Link>
            .
          </p>
        )}

        {!isLoading && !isError && resources.length === 0 && (
          <p className="text-sm text-(--t3)">
            No public resources yet.{' '}
            <Link to="/resources" className="text-(--cy) hover:underline">
              Be the first to publish one
            </Link>
            .
          </p>
        )}

        {!isLoading && !isError && resources.length > 0 && (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <li key={resource.id}>
                <ResourceCardItem resource={resource} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 sm:hidden">
          <Button asChild variant="outline" size="sm">
            <Link to="/resources">Browse all →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ResourceCardItem({ resource }: { resource: Resource }) {
  return (
    // Stretched-link pattern, identical to ResourcesGrid so the cards
    // feel native to the rest of the app.
    <div className="group/card relative flex h-full flex-col overflow-hidden rounded-(--radius-card) bg-(--sur) shadow-sm ring-1 ring-(--bor2)/50 transition-all duration-150 hover:-translate-y-px hover:shadow-md focus-within:ring-2 focus-within:ring-(--cy)">
      <Link
        to={`/resources/${resource.id}`}
        aria-label={`Open ${resource.name}`}
        className="absolute inset-0 z-0"
      />

      <Card className="h-full border-0 bg-transparent shadow-none ring-0">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <Badge variant="outline" className="shrink-0 bg-(--cy-b) text-(--t1)">
              {KIND_LABELS[resource.kind]}
            </Badge>
            <div className="flex items-center gap-3 font-(--font-mono) text-[11px] text-(--t3)">
              <span>{resource.upvote_count} ↑</span>
              <span>{resource.fork_count} forks</span>
            </div>
          </div>
          <CardTitle className="mt-3 text-base text-(--t1)">{resource.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          {resource.description && (
            <p className="line-clamp-3 text-sm leading-relaxed text-(--t2)">
              {resource.description}
            </p>
          )}
          {resource.author && (
            <p className="mt-3 font-(--font-mono) text-[11px] tracking-wider text-(--t3) uppercase">
              by{' '}
              <Link
                to={`/users/${resource.author.id}`}
                aria-label={`View ${resource.author.name}'s profile`}
                className="relative z-10 text-(--cy) no-underline hover:underline"
              >
                {resource.author.name}
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FeaturedResourcesSkeleton() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading featured resources">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="overflow-hidden rounded-(--radius-card) border border-(--bor2)/40 bg-(--sur) p-(--space-card-pad)"
        >
          <Skeleton className="mb-3 h-5 w-20" />
          <Skeleton className="mb-2 h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-5/6" />
        </li>
      ))}
    </ul>
  );
}