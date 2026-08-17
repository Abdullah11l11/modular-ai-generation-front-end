import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useResource } from '@/features/resources/hooks/useResource';
import { useUpdateResource } from '@/features/resources/hooks/useUpdateResource';
import { useDeleteResource } from '@/features/resources/hooks/useDeleteResource';
import { useMe } from '@/features/me/hooks/useMe';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Heart, GitBranch, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export function ResourceDetailPage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const { data: resource, isLoading, error } = useResource(resourceId as string);
  const { data: me } = useMe();
  const navigate = useNavigate();

  const updateMutation = useUpdateResource();
  const deleteMutation = useDeleteResource();

  const [values, setValues] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editKind, setEditKind] = useState<ResourceKind>('prompt');
  const [editVisibility, setEditVisibility] = useState<Visibility>('public');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const segments = useMemo(() => (resource ? parseContent(resource.content) : []), [resource]);

  const preview = useMemo(() => {
    if (!resource) return '';
    return resource.content.replace(PLACEHOLDERS_REGEX, (_: string, key: string) =>
      values[key] ? values[key] : `{{${key}}}`,
    );
  }, [resource, values]);

  const isOwner = !!me && !!resource && me.id === resource.user_id;

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
    } catch (err) {
      toast.error('Failed to update resource');
      console.error(err);
    }
  };

  const confirmAndDelete = async () => {
    if (!resource) return;
    try {
      await deleteMutation.mutateAsync(resource.id);
      toast.success('Resource deleted');
      navigate('/resources');
    } catch (err) {
      toast.error('Failed to delete resource');
      console.error(err);
    }
  };

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
