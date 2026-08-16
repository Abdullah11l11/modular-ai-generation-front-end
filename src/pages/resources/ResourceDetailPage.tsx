import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useResource } from '@/features/resources/hooks/useResource';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Heart, GitBranch } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
const KIND_LABELS: Record<string, string> = {
  prompt: 'Prompt',
  skill: 'Skill',
  agent: 'Agent',
  rule: 'Rule',
  mcp: 'MCP',
  design_doc: 'Design Doc',
  hook: 'Hook',
};
const PLACEHOLDERS_REGEX = /\{\{(\w+)\}\}/g;
type ContentSegment = { type: 'text'; value: string } | { type: 'placeholder'; key: string };
// Hello {{name}} welocme to city {{}}
// {type:'text' ; value: 'Hello'}
//{type: 'placeholder' ; value : 'name'}

function parseContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = PLACEHOLDERS_REGEX.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'placeholder', key: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', value: content.slice(lastIndex) });
  }
  return segments;
}
//exec() => بترجع
//match.index  match[0] التطابق كله   match[1] فقط الكلمة
export function ResourceDetailPage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const { data: resource, isLoading, error } = useResource(resourceId as string);
  const [values, setValues] = useState<Record<string, string>>({});
  const segments = useMemo(() => (resource ? parseContent(resource.content) : []), [resource]);

  const preview = useMemo(() => {
    if (!resource) return '';
    return resource.content.replace(PLACEHOLDERS_REGEX, (_: string, key: string) =>
      values[key] ? values[key] : `{{${key}}}`,
    );
  }, [resource, values]);
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="mb-6 h-10 w-3/4" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p className="text-(--t2)"> Resource Not Found </p>
        <Button asChild variant="ghost" className="mt-4">
          <Link to="/resources">Back To Resources</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-4xl p-6">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/resources">
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </Button>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-(--t1)">{resource.name}</h1>
            <Badge variant="secondary">{KIND_LABELS[resource.kind] ?? resource.kind}</Badge>
          </div>
          {resource.description && <p className="text-sm text-(--t2)">{resource.description}</p>}
          <div className="flex flex-wrap items-center gap-3 text-xs text-(--t3)">
            {resource.author && <span>by {resource.author.name}</span>}
            {resource.tags.map((tag: string) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Heart className="size-4" />
            {resource.upvote_count}
          </Button>

          <Button variant="outline" size="sm">
            <GitBranch className="size-4" />
            {resource.fork_count}
          </Button>
        </div>
      </div>
      <div className="mb-8 rounded-xl  border-2  border-(--bor) bg-(--sur) p-4">
        <h2 className="mb-3 text-sm font-semibold text-(--t2)">Content</h2>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-(--t1)">
          {segments.map((seg, i) =>
            seg.type === 'placeholder' ? (
              <span
                key={i}
                className="inline-block rounded-md bg-(--cy-d) px-1.5 py-0.5 font-mono text-xs text-(--cy)"
              >
                {'{{'}
                {seg.key}
                {'}}'}
              </span>
            ) : (
              <span key={i}>{seg.value}</span>
            ),
          )}
        </div>
      </div>

      {resource.placeholders && resource.placeholders.length > 0 && (
        <div className="mb-8 space-y-4 ">
          <h2 className="text-sm font-semibold text-(--t1)">Fill Placeholders</h2>
          {resource.placeholders.map((p) => (
            <div key={p.key} className="space-y-1.5">
              <label className="text-xs font-meduim text-(--t2)">{p.label}</label>
              {p.type === 'textarea' ? (
                <textarea
                  placeholder={p.default || `Enter ${p.label.toLowerCase()}...`}
                  value={values[p.key] ?? ''}
                  onChange={(e) => setValues((prev) => ({ ...prev, [p.key]: e.target.value }))}
                />
              ) : p.type === 'select' ? (
                <Select
                  value={values[p.key] ?? ''}
                  onValueChange={(v) => setValues((prev) => ({ ...prev, [p.key]: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={p.default || 'Select...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder={p.default || `Enter ${p.label.toLowerCase()}...`}
                  value={values[p.key] ?? ''}
                  onChange={(e) => setValues((prev) => ({ ...prev, [p.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border-2 border-(--cy) bg-(--sur) p-4">
        <h2 className="mb-3 text-sm font-semibold text-(--t1)">Preview</h2>
        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-(--t1)">{preview}</pre>
      </div>
    </div>
  );
}
