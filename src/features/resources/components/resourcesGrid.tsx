import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Resource } from '@/types/api';
import { Link } from 'react-router-dom';

const KIND_LABELS: Record<string, string> = {
  prompt: 'Prompt',
  skill: 'Skill',
  agent: 'Agent',
  rule: 'Rule',
  mcp: 'MCP',
  design_doc: 'Design Doc',
  hook: 'Hook',
};

type ResourcesGridProps = {
  resources: Resource[];
};

// Stretched-link pattern: the card is a div, an inner absolute <Link> covers
// the whole surface for navigation, and a separate <Link> for the author
// sits above (z-10) so it gets its own click. Avoids nested-anchor
// hydration errors in React 19.
export function ResourcesGrid({ resources }: ResourcesGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="group/card relative flex flex-col overflow-hidden rounded-(--r12,12px) bg-(--sur) shadow-sm ring-1 ring-(--bor2)/50 transition-all duration-150 hover:-translate-y-px hover:shadow-md focus-within:ring-2 focus-within:ring-(--cy)"
        >
          <Link
            to={`/resources/${resource.id}`}
            aria-label={`Open ${resource.name}`}
            className="absolute inset-0 z-0"
          />
          <Card className="border-0 bg-transparent shadow-none ring-0">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm">{resource.name}</CardTitle>
                <Badge variant="outline" className="shrink-0 bg-(--cy-b) dark:bg-(--bor2)">
                  {KIND_LABELS[resource.kind] ?? resource.kind}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {resource.description && (
                <p className="line-clamp-2 text-xs text-(--t2)">{resource.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--t3)">
                <span>{resource.fork_count} forks</span>
                <span>{resource.upvote_count} upvotes</span>
                {resource.author && (
                  <Link
                    to={`/users/${resource.author.id}`}
                    aria-label={`View ${resource.author.name}'s profile`}
                    className="relative z-10 rounded text-(--cy) hover:underline"
                  >
                    by {resource.author.name}
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
