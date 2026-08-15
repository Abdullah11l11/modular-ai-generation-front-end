import { useState } from 'react';
import {
  MoreHorizontal,
  Pencil,
  Reply,
  Trash2,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { CommentComposer } from './CommentComposer';

import type { Comment } from '../types/comment';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  depth?: number;

  isSubmitting?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;

  onReply: (commentId: string, body: string) => void;
  onEdit: (commentId: string, body: string) => void;
  onDelete: (commentId: string) => void;
}

const MAX_COMMENT_DEPTH = 20;

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatCommentDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function CommentItem({
  comment,
  currentUserId,
  depth = 0,
  isSubmitting = false,
  isUpdating = false,
  isDeleting = false,
  onReply,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);

  const isOwner =
    Boolean(currentUserId) &&
    comment.user_id === currentUserId;

  const canReply = depth < MAX_COMMENT_DEPTH;

  const handleReply = (body: string) => {
    onReply(comment.id, body);
    setReplying(false);
  };

  const handleEdit = (body: string) => {
    onEdit(comment.id, body);
    setEditing(false);
  };

  return (
    <div
      className="relative"
      style={{
        marginLeft: depth > 0 ? Math.min(depth * 28, 140) : 0,
      }}
    >
      <div className="flex gap-3">
        <Avatar className="size-8 shrink-0">
          <AvatarImage
            src={comment.author.avatar_url ?? undefined}
            alt={comment.author.name}
          />

          <AvatarFallback className="bg-[#0B1F3A] text-xs text-white">
            {getInitials(comment.author.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="group rounded-xl border border-border bg-card p-3 transition-colors hover:border-cyan-500/40">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-semibold">
                  {comment.author.name}
                </span>

                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {formatCommentDate(comment.created_at)}
                </span>
              </div>

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setEditing(true)}
                    >
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      disabled={isDeleting}
                      onClick={() => onDelete(comment.id)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {editing ? (
              <CommentComposer
                autoFocus
                placeholder="Edit your comment..."
                submitLabel="Save"
                isPending={isUpdating}
                onSubmit={handleEdit}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                {comment.body}
              </p>
            )}
          </div>

          <div className="mt-1 flex items-center gap-1">
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => setReplying((value) => !value)}
              >
                <Reply className="mr-1.5 size-3.5" />
                Reply
              </Button>
            )}
          </div>

          {replying && canReply && (
            <div className="mt-2">
              <CommentComposer
                autoFocus
                placeholder={`Reply to ${comment.author.name}...`}
                submitLabel="Reply"
                isPending={isSubmitting}
                onSubmit={handleReply}
                onCancel={() => setReplying(false)}
              />
            </div>
          )}

          {comment.replies?.length > 0 && (
            <div className="mt-4 space-y-4">
              <Separator />

              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  depth={depth + 1}
                  isSubmitting={isSubmitting}
                  isUpdating={isUpdating}
                  isDeleting={isDeleting}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}