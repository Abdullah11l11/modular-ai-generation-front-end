import { Card , CardHeader , CardContent , CardTitle } from '@/components/ui/card';
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

export function ResourcesGrid({ resources }: ResourcesGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <Link key={resource.id} to= {`/resources/${resource.id}`}  >
        <Card key={resource.id}>
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
            <div className="flex items-center gap-3 text-xs text-(--t3)">
              <span>{resource.fork_count} forks</span>
              <span>{resource.upvote_count} upvotes</span>
              {resource.author && <span>by {resource.author.name}</span>}
            </div>
          </CardContent>
        </Card>
        </Link>
      ))}
    </div>
  );
}
