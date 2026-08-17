import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComments } from '@/features/social/hooks/useComments';
import { useCreateComment } from '@/features/social/hooks/useCreateComment';
import { useUpdateComment } from '@/features/social/hooks/useUpdateComment';
import { useDeleteComment } from '@/features/social/hooks/useDeleteComment';
import { useMe } from '@/features/me/hooks/useMe';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { formatRelativeTime } from '@/lib/format';
import { toast } from 'sonner';
import { Loader2, MessageSquare, Pencil, Trash2, X, Check } from 'lucide-react';
import type { Comment, Id } from '@/types/api';
import type { SocialTarget } from '@/features/social/types/socialTarget';

type CommentsSectionProps = {
  target: SocialTarget;
  targetId: Id;
};

export function CommentsSection({ target, targetId }: CommentsSectionProps) {
  const { data, isLoading } = useComments(target, targetId);
  const { data: me } = useMe();
  const createComment = useCreateComment();
  const updateComment = useUpdateComment(target, targetId);
  const deleteComment = useDeleteComment(target, targetId);

  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<Id | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [deletingId, setDeletingId] = useState<Id | null>(null);

  const comments = data?.data ?? [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    try {
      await createComment.mutateAsync({ target, targetId, payload: { body } });
      setDraft('');
      toast.success('Comment posted');
    } catch {
      toast.error('Failed to post comment');
    }
  };

  const startEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditDraft(c.content);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const body = editDraft.trim();
    if (!body) return;
    try {
      await updateComment.mutateAsync({ commentId: editingId, payload: { body } });
      toast.success('Comment updated');
      setEditingId(null);
      setEditDraft('');
    } catch {
      toast.error('Failed to update comment');
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteComment.mutateAsync(deletingId);
      toast.success('Comment deleted');
      setDeletingId(null);
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-(--t1)">
        <MessageSquare className="size-4" />
        Comments
        {comments.length > 0 && (
          <span className="text-[10px] font-normal text-(--t3)">({comments.length})</span>
        )}
      </h2>

      {/* Composer */}
      {me ? (
        <form
          onSubmit={submit}
          className="rounded-2xl border border-(--bor) bg-(--sur) p-4"
        >
          <div className="flex gap-3">
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={me.profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {me.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                maxLength={2000}
              />
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-(--t3)">
                  {draft.length} / 2000
                </p>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createComment.isPending || !draft.trim()}
                >
                  {createComment.isPending && <Loader2 className="size-3.5 animate-spin" />}
                  Post
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <p className="rounded-xl border border-dashed border-(--bor) bg-(--sur) p-3 text-center text-xs text-(--t3)">
          Sign in to join the conversation.
        </p>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-md" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <EmptyState
          title="No comments yet"
          description="Be the first to say something."
        />
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => {
            const isMine = !!me && c.user_id === me.id;
            const isEditing = editingId === c.id;
            return (
              <li
                key={c.id}
                className="flex gap-3 rounded-xl border border-(--bor) bg-(--sur) p-3"
              >
                <Avatar className="size-7 shrink-0">
                  {c.author?.avatar_url ? (
                    <AvatarImage src={c.author.avatar_url} alt={c.author.name} />
                  ) : null}
                  <AvatarFallback className="bg-(--acc) text-[10px] font-bold text-(--sur)">
                    {c.author?.name?.trim().charAt(0).toUpperCase() ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      {c.author ? (
                        <Link
                          to={`/users/${c.author.id}`}
                          className="font-medium text-(--cy) hover:underline"
                        >
                          {c.author.name}
                        </Link>
                      ) : (
                        <span className="font-medium text-(--t1)">Unknown</span>
                      )}
                      <span className="text-(--t3)">
                        {formatRelativeTime(c.created_at)}
                      </span>
                      {c.updated_at !== c.created_at && (
                        <span className="text-(--t3)">(edited)</span>
                      )}
                    </div>
                    {isMine && !isEditing && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="rounded p-1 text-(--t3) hover:bg-(--sur2) hover:text-(--t1)"
                          aria-label="Edit comment"
                        >
                          <Pencil className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(c.id)}
                          className="rounded p-1 text-(--t3) hover:bg-(--sur2) hover:text-(--err)"
                          aria-label="Delete comment"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        rows={3}
                        maxLength={2000}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null);
                            setEditDraft('');
                          }}
                          disabled={updateComment.isPending}
                        >
                          <X className="size-3.5" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={saveEdit}
                          disabled={updateComment.isPending || !editDraft.trim()}
                        >
                          {updateComment.isPending ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-(--t2)">
                      {c.content}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Confirm delete */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-(--bor) bg-(--sur) p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-(--t1)">Delete this comment?</h3>
            <p className="mt-1 text-xs text-(--t2)">
              This cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDeletingId(null)}
                disabled={deleteComment.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteComment.isPending}
              >
                {deleteComment.isPending && <Loader2 className="size-3.5 animate-spin" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
