import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useResource } from '@/features/resources/hooks/useResource';
import { useUpdateResource } from '@/features/resources/hooks/useUpdateResource';
import { useDeleteResource } from '@/features/resources/hooks/useDeleteResource';
import { useForkResource } from '@/features/resources/hooks/useForkResource';
import { createResource as createResourceApi } from '@/features/resources/api/createResource';
import { useMe } from '@/features/me/hooks/useMe';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/empty-state';
import {
  ArrowLeft,
  Heart,
  GitBranch,
  Bookmark,
  Pencil,
  Trash2,
  Copy,
  Download,
  RotateCcw,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ResourceKind, Visibility } from '@/types/api';

const KIND_LABELS: Record<string, string> = {
  prompt: 'Prompt',
  skill: 'Skill',
  agent: 'Agent',
  rule: 'Rule',
  mcp: 'MCP',
  design_doc: 'Design Doc',
  hook: 'Hook',
};

const KIND_OPTIONS: { value: ResourceKind; label: string }[] = [
  { value: 'prompt', label: 'Prompt' },
  { value: 'skill', label: 'Skill' },
  { value: 'agent', label: 'Agent' },
  { value: 'rule', label: 'Rule' },
  { value: 'mcp', label: 'MCP' },
  { value: 'design_doc', label: 'Design Doc' },
  { value: 'hook', label: 'Hook' },
];

const PLACEHOLDERS_REGEX = /\{\{(\w+)\}\}/g;
type ContentSegment = { type: 'text'; value: string } | { type: 'placeholder'; key: string };

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

function fillContent(content: string, values: Record<string, string>): string {
  return content.replace(PLACEHOLDERS_REGEX, (_, key) => values[key]?.trim() || `{{${key}}}`);
}

function downloadAsFile(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeFilename(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'resource';
}

export function ResourceDetailPage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const { data: resource, isLoading, error } = useResource(resourceId as string);
  const { data: me } = useMe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const updateMutation = useUpdateResource();
  const deleteMutation = useDeleteResource();
  const forkMutation = useForkResource();

  const upvoteMutation = useMutation({
    mutationFn: () => fetch(`/api/v1/resources/${resourceId}/upvote`, { method: 'POST' }).then((r) => r.json()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['resources', resourceId] });
    },
  });

  const [values, setValues] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editKind, setEditKind] = useState<ResourceKind>('prompt');
  const [editVisibility, setEditVisibility] = useState<Visibility>('public');
  const [copied, setCopied] = useState<'filled' | 'raw' | null>(null);

  const segments = useMemo(() => (resource ? parseContent(resource.content) : []), [resource]);
  const filled = useMemo(
    () => (resource ? fillContent(resource.content, values) : ''),
    [resource, values],
  );
  const missingKeys = useMemo(() => {
    if (!resource) return [];
    const placeholders = resource.placeholders ?? [];
    return placeholders
      .map((p) => p.key)
      .filter((k) => !values[k] || !values[k].trim());
  }, [resource, values]);

  const isOwner = !!me && !!resource && me.id === resource.user_id;
  const hasPlaceholders = !!resource?.placeholders && resource.placeholders.length > 0;

  const setVal = (key: string, v: string) => setValues((prev) => ({ ...prev, [key]: v }));
  const resetOne = (key: string, fallback = '') => setValues((prev) => ({ ...prev, [key]: fallback }));
  const resetAll = () => setValues({});

  const fillDefaults = () => {
    if (!resource?.placeholders) return;
    const next: Record<string, string> = {};
    resource.placeholders.forEach((p) => {
      next[p.key] = p.default ?? '';
    });
    setValues(next);
  };

  const copyText = async (text: string, which: 'filled' | 'raw') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      toast.success(which === 'filled' ? 'Filled prompt copied' : 'Raw content copied');
      setTimeout(() => setCopied((c) => (c === which ? null : c)), 1500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const downloadFilled = () => {
    if (!resource) return;
    downloadAsFile(`${safeFilename(resource.name)}.md`, filled);
  };

  const startEditing = () => {
    if (!resource) return;
    setEditName(resource.name);
    setEditDescription(resource.description ?? '');
    setEditContent(resource.content);
    setEditKind(resource.kind);
    setEditVisibility(resource.visibility);
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!resource) return;
    try {
      await updateMutation.mutateAsync({
        resourceId: resource.id,
        payload: {
          name: editName,
          description: editDescription || null,
          body: editContent,
          kind: editKind,
          visibility: editVisibility,
        },
      });
      toast.success('Resource updated');
      setEditing(false);
    } catch {
      toast.error('Failed to update resource');
    }
  };

  const confirmAndDelete = async () => {
    if (!resource) return;
    try {
      await deleteMutation.mutateAsync(resource.id);
      toast.success('Resource deleted');
      navigate('/resources');
    } catch {
      toast.error('Failed to delete resource');
    }
  };

  const forkThis = async () => {
    if (!resource) return;
    try {
      const forked = await forkMutation.mutateAsync({ resourceId: resource.id });
      toast.success('Forked to your library');
      navigate(`/resources/${forked.id}`);
    } catch {
      toast.error('Failed to fork resource');
    }
  };

  const forkWithValues = async () => {
    if (!resource) return;
    try {
      const created = await createResourceApi({
        kind: resource.kind,
        name: `${resource.name} (filled)`,
        description: resource.description ?? null,
        body: filled,
        visibility: 'private',
        tags: resource.tags,
      });
      toast.success('Filled copy saved to your library');
      navigate(`/resources/${created.id}`);
    } catch {
      toast.error('Failed to save filled copy');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="mb-6 h-10 w-3/4" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <EmptyState
          title="Resource not found"
          description="The resource may have been deleted or you may not have access."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/resources">Back to resources</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/resources">
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-6 rounded-2xl border border-(--bor) bg-(--sur) p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{KIND_LABELS[resource.kind] ?? resource.kind}</Badge>
              {resource.visibility === 'private' && (
                <Badge variant="outline" className="text-[10px]">Private</Badge>
              )}
              {resource.visibility === 'unlisted' && (
                <Badge variant="outline" className="text-[10px]">Unlisted</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-(--t1)">{resource.name}</h1>
            {resource.description && (
              <p className="text-sm text-(--t2)">{resource.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-(--t3)">
              {resource.author && <span>by {resource.author.name}</span>}
              <span>·</span>
              <span>
                Created {new Date(resource.created_at).toLocaleDateString()}
              </span>
              {resource.tags.length > 0 && <span>·</span>}
              {resource.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={resource.is_upvoted ? 'default' : 'outline'}
              size="sm"
              onClick={() => upvoteMutation.mutate()}
              disabled={upvoteMutation.isPending}
              className={cn(resource.is_upvoted && 'bg-(--cy) text-(--cy-fg) hover:bg-(--cy)/90')}
            >
              <Heart className={cn('size-4', resource.is_upvoted && 'fill-current')} />
              {resource.upvote_count}
            </Button>

            <Button
              variant={resource.is_bookmarked ? 'default' : 'outline'}
              size="sm"
              onClick={() => toast.info('Bookmark endpoint wired but UI not enabled in this round')}
              className={cn(resource.is_bookmarked && 'bg-(--cy) text-(--cy-fg)')}
            >
              <Bookmark className={cn('size-4', resource.is_bookmarked && 'fill-current')} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={forkThis}
              disabled={forkMutation.isPending}
            >
              <GitBranch className="size-4" />
              {forkMutation.isPending ? 'Forking...' : `Fork · ${resource.fork_count}`}
            </Button>

            {isOwner && (
              <>
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="text-(--err) hover:text-(--err)"
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue={hasPlaceholders ? 'use' : 'raw'}>
            <TabsList>
              <TabsTrigger value="use" disabled={!hasPlaceholders}>
                Use {hasPlaceholders && <span className="ml-1.5 text-[10px]">· {resource.placeholders!.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="raw">Raw</TabsTrigger>
            </TabsList>

            <TabsContent value="use" className="space-y-4">
              {hasPlaceholders ? (
                <>
                  <div className="rounded-2xl border border-(--bor) bg-(--sur) p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-semibold text-(--t1)">Fill the blanks</h2>
                        <p className="text-xs text-(--t3)">
                          The preview updates as you type.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={fillDefaults}
                          disabled={!resource.placeholders?.some((p) => p.default)}
                        >
                          Use defaults
                        </Button>
                        <Button variant="ghost" size="sm" onClick={resetAll} disabled={Object.keys(values).length === 0}>
                          <RotateCcw className="size-3.5" />
                          Reset
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {resource.placeholders!.map((p) => {
                        const v = values[p.key] ?? '';
                        const isMissing = missingKeys.includes(p.key);
                        return (
                          <div key={p.key} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-(--t2)">
                                {p.label}{' '}
                                <span className="font-mono text-[10px] text-(--t3)">
                                  {`{{${p.key}}}`}
                                </span>
                              </label>
                              {v && (
                                <button
                                  type="button"
                                  onClick={() => resetOne(p.key, p.default ?? '')}
                                  className="text-[10px] text-(--t3) hover:text-(--t2)"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                            {p.type === 'textarea' ? (
                              <Textarea
                                rows={3}
                                value={v}
                                onChange={(e) => setVal(p.key, e.target.value)}
                                placeholder={p.default || `Enter ${p.label.toLowerCase()}...`}
                                className={cn(isMissing && 'border-(--err)/40')}
                              />
                            ) : (
                              <Input
                                value={v}
                                onChange={(e) => setVal(p.key, e.target.value)}
                                placeholder={p.default || `Enter ${p.label.toLowerCase()}...`}
                                className={cn(isMissing && 'border-(--err)/40')}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {missingKeys.length > 0 && (
                      <p className="mt-4 text-[11px] text-(--t3)">
                        <span className="text-(--err)">{missingKeys.length}</span>{' '}
                        blank{missingKeys.length === 1 ? '' : 's'} will show as{' '}
                        <span className="font-mono">{`{{key}}`}</span> in the preview.
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border-2 border-(--cy)/40 bg-(--sur) p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-(--t1)">Preview</h2>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyText(filled, 'filled')}
                        >
                          {copied === 'filled' ? (
                            <Check className="size-3.5 text-(--cy)" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                          {copied === 'filled' ? 'Copied' : 'Copy'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadFilled}>
                          <Download className="size-3.5" />
                          Download .md
                        </Button>
                        {isOwner && missingKeys.length === 0 && (
                          <Button variant="outline" size="sm" onClick={forkWithValues}>
                            <GitBranch className="size-3.5" />
                            Save filled copy
                          </Button>
                        )}
                      </div>
                    </div>
                    <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap text-sm leading-relaxed text-(--t1)">
                      {filled}
                    </pre>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="This resource has no placeholders"
                  description="Switch to the Raw tab to view the content."
                />
              )}
            </TabsContent>

            <TabsContent value="raw">
              <div className="rounded-2xl border border-(--bor) bg-(--sur) p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-(--t1)">Raw content</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyText(resource.content, 'raw')}
                  >
                    {copied === 'raw' ? (
                      <Check className="size-3.5 text-(--cy)" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    {copied === 'raw' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
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
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-(--bor) bg-(--sur) p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-(--t3)">
              About this resource
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-(--t3)">Kind</dt>
                <dd className="text-(--t1)">{KIND_LABELS[resource.kind] ?? resource.kind}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-(--t3)">Forks</dt>
                <dd className="text-(--t1)">{resource.fork_count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-(--t3)">Upvotes</dt>
                <dd className="text-(--t1)">{resource.upvote_count}</dd>
              </div>
              {hasPlaceholders && (
                <div className="flex justify-between">
                  <dt className="text-(--t3)">Placeholders</dt>
                  <dd className="text-(--t1)">{resource.placeholders!.length}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-(--t3)">Created</dt>
                <dd className="text-(--t1)">
                  {new Date(resource.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {isOwner && hasPlaceholders && missingKeys.length === 0 && (
            <div className="rounded-2xl border border-(--cy)/40 bg-(--cy-d) p-5">
              <h3 className="mb-2 text-sm font-semibold text-(--t1)">Save filled version</h3>
              <p className="mb-3 text-xs text-(--t2)">
                Create a private copy with the current placeholder values baked in. Useful for
                archiving a specific instance.
              </p>
              <Button size="sm" className="w-full" onClick={forkWithValues}>
                <GitBranch className="size-3.5" />
                Save filled copy
              </Button>
            </div>
          )}
        </aside>
      </div>

      {/* Edit dialog */}
      {editing && (
        <Dialog open={editing} onOpenChange={(open) => !open && setEditing(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit resource</DialogTitle>
              <DialogDescription>
                Changes save immediately and update the public listing.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-(--t2)">Name</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-(--t2)">Kind</label>
                  <Select value={editKind} onValueChange={(v) => setEditKind(v as ResourceKind)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KIND_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-(--t2)">Visibility</label>
                  <Select
                    value={editVisibility}
                    onValueChange={(v) => setEditVisibility(v as Visibility)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-(--t2)">Description</label>
                <Textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-(--t2)">Content</label>
                <Textarea
                  rows={10}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditing(false)} disabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={saveEdit} disabled={updateMutation.isPending || !editName.trim()}>
                {updateMutation.isPending ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirm */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this resource?</DialogTitle>
            <DialogDescription>
              <span className="block">
                “{resource.name}” will be soft-deleted. Anyone who forked it keeps their copy.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmAndDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
