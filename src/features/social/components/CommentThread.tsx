// import { useState } from 'react';
// import { MessageSquare, AlertCircle } from 'lucide-react';

// import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';
// import { Skeleton } from '@/components/ui/skeleton';

// import { useComments } from '../hooks/useComments';
// import { useCreateComment } from '../hooks/useCreateComment';
// import { useUpdateComment } from '../hooks/useUpdateComment';
// import { useDeleteComment } from '../hooks/useDeleteComment';

// import { CommentComposer } from './CommentComposer';
// import { CommentItem } from './CommentItem';
// import { CommentPagination } from './CommentPagination';

// import type { SocialTarget} from '@/features/social/types/socialTarget';

// interface CommentThreadProps {
//   target: SocialTarget;
//   targetId: string;
//   currentUserId?: string;
//   perPage?: number;
// }

// export function CommentThread({
//   target,
//   targetId,
//   currentUserId,
//   perPage = 10,
// }: CommentThreadProps) {
//   const [page, setPage] = useState(1);

//   const commentsQuery = useComments(target, targetId, {
//     page,
//     per_page: perPage,
//   });

//   const createCommentMutation = useCreateComment();
//   const updateCommentMutation = useUpdateComment();
//   const deleteCommentMutation = useDeleteComment();

//   const comments = commentsQuery.data?.data ?? [];
//   const meta = commentsQuery.data?.meta;

//   const handleCreate = (body: string, parentId?: string | null) => {
//     createCommentMutation.mutate({
//       target,
//       targetId,
//       payload: {
//         body,
//         parent_id: parentId ?? null,
//       },
//     });
//   };

//   const handleUpdate = (commentId: string, body: string) => {
//     updateCommentMutation.mutate({
//       commentId,
//       target,
//       targetId,
//       payload: {
//         body,
//       },
//     });
//   };

//   const handleDelete = (commentId: string) => {
//     deleteCommentMutation.mutate({
//       commentId,
//       target,
//       targetId,
//     });
//   };

//   const handlePageChange = (nextPage: number) => {
//     setPage(nextPage);

//     window.requestAnimationFrame(() => {
//       document
//         .getElementById('comments-thread')
//         ?.scrollIntoView({
//           behavior: 'smooth',
//           block: 'start',
//         });
//     });
//   };

//   return (
//     <section
//       id="comments-thread"
//       className="w-full"
//       aria-labelledby="comments-heading"
//     >
//       <div className="mb-5 flex items-center justify-between gap-4">
//         <div>
//           <div className="flex items-center gap-2">
//             <MessageSquare className="size-4 text-cyan-500" />

//             <h2
//               id="comments-heading"
//               className="text-lg font-bold tracking-tight"
//             >
//               Comments
//             </h2>
//           </div>

//           {meta && (
//             <p className="mt-1 text-xs text-muted-foreground">
//               {meta.total} {meta.total === 1 ? 'comment' : 'comments'}
//             </p>
//           )}
//         </div>
//       </div>

//       <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
//         {/* <CommentComposer
//           placeholder={
//             currentUserId
//               ? 'Share your thoughts...'
//               : 'Sign in to leave a comment.'
//           }
//           submitLabel="Post comment"
//           isPending={createCommentMutation.isPending}
//           onSubmit={(body) => handleCreate(body)}
//         /> */}
// {currentUserId ? (
//   <CommentComposer
//     placeholder="Share your thoughts..."
//     submitLabel="Post comment"
//     isPending={createCommentMutation.isPending}
//     onSubmit={(body) => handleCreate(body)}
//   />
// ) : (
//   <div className="rounded-lg border border-dashed border-border p-4 text-center">
//     <p className="text-sm font-medium">
//       Sign in to join the discussion
//     </p>

//     <p className="mt-1 text-xs text-muted-foreground">
//       You can still read all comments and replies.
//     </p>
//   </div>
// )}
//         {!currentUserId && (
//           <p className="mt-2 text-xs text-muted-foreground">
//             You can read the discussion without signing in.
//           </p>
//         )}
//       </div>

//       <Separator className="my-6" />

//       {commentsQuery.isLoading ? (
//         <CommentThreadSkeleton />
//       ) : commentsQuery.isError ? (
//         <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
//           <div className="flex items-start gap-3">
//             <AlertCircle className="mt-0.5 size-4 text-destructive" />

//             <div>
//               <p className="text-sm font-medium">
//                 Unable to load comments
//               </p>

//               <p className="mt-1 text-xs text-muted-foreground">
//                 Something went wrong while loading this discussion.
//               </p>

//               <Button
//                 variant="outline"
//                 size="sm"
//                 className="mt-3"
//                 onClick={() => commentsQuery.refetch()}
//               >
//                 Try again
//               </Button>
//             </div>
//           </div>
//         </div>
//       ) : comments.length === 0 ? (
//         <div className="rounded-xl border border-dashed border-border p-10 text-center">
//           <MessageSquare className="mx-auto mb-3 size-7 text-muted-foreground" />

//           <p className="text-sm font-medium">
//             No comments yet
//           </p>

//           <p className="mt-1 text-xs text-muted-foreground">
//             Be the first to start the conversation.
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {comments.map((comment) => (
//             <CommentItem
//               key={comment.id}
//               comment={comment}
//               currentUserId={currentUserId}
//               isSubmitting={createCommentMutation.isPending}
//               isUpdating={updateCommentMutation.isPending}
//               isDeleting={deleteCommentMutation.isPending}
//               onReply={(commentId, body) =>
//                 handleCreate(body, commentId)
//               }
//               onEdit={handleUpdate}
//               onDelete={handleDelete}
//             />
//           ))}
//         </div>
//       )}

//       {meta && (
//         <CommentPagination
//           currentPage={meta.current_page}
//           lastPage={meta.last_page}
//           isPending={commentsQuery.isFetching}
//           onPageChange={handlePageChange}
//         />
//       )}
//     </section>
//   );
// }

// function CommentThreadSkeleton() {
//   return (
//     <div className="space-y-6">
//       {Array.from({ length: 3 }).map((_, index) => (
//         <div key={index} className="flex gap-3">
//           <Skeleton className="size-8 rounded-full" />

//           <div className="flex-1 space-y-2">
//             <Skeleton className="h-4 w-32" />
//             <Skeleton className="h-16 w-full rounded-xl" />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
import { useState } from 'react';
import { MessageSquare, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import { useComments } from '../hooks/useComments';
import { useCreateComment } from '../hooks/useCreateComment';
import { useUpdateComment } from '../hooks/useUpdateComment';
import { useDeleteComment } from '../hooks/useDeleteComment';

import { CommentComposer } from './CommentComposer';
import { CommentItem } from './CommentItem';
import { CommentPagination } from './CommentPagination';

import type { SocialTarget } from '@/features/social/types/socialTarget';

interface CommentThreadProps {
  target: SocialTarget;
  targetId: string;
  currentUserId?: string;
  perPage?: number;
}

export function CommentThread({
  target,
  targetId,
  currentUserId,
  perPage = 10,
}: CommentThreadProps) {
  const [page, setPage] = useState(1);

  const commentsQuery = useComments(target, targetId, {
    page,
    per_page: perPage,
  });

  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  const comments = commentsQuery.data?.data ?? [];
  const meta = commentsQuery.data?.meta;

  const handleCreate = (body: string, parentId?: string | null) => {
    createCommentMutation.mutate({
      target,
      targetId,
      payload: {
        body,
        parent_id: parentId ?? null,
      },
    });
  };

  const handleUpdate = (commentId: string, body: string) => {
    updateCommentMutation.mutate({
      commentId,
      target,
      targetId,
      payload: {
        body,
      },
    });
  };

  const handleDelete = (commentId: string) => {
    deleteCommentMutation.mutate({
      commentId,
      target,
      targetId,
    });
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);

    window.requestAnimationFrame(() => {
      document
        .getElementById('comments-thread')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    });
  };

  return (
    <section
      id="comments-thread"
      className="w-full"
      aria-labelledby="comments-heading"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-cyan-500" />

            <h2
              id="comments-heading"
              className="text-lg font-bold tracking-tight"
            >
              Comments
            </h2>
          </div>

          {meta && (
            <p className="mt-1 text-xs text-muted-foreground">
              {meta.total} {meta.total === 1 ? 'comment' : 'comments'}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <CommentComposer
          placeholder={
            currentUserId
              ? 'Share your thoughts...'
              : 'Sign in to leave a comment.'
          }
          submitLabel="Post comment"
          isPending={createCommentMutation.isPending}
          onSubmit={(body) => handleCreate(body)}
        />

        {!currentUserId && (
          <p className="mt-2 text-xs text-muted-foreground">
            You can read the discussion without signing in.
          </p>
        )}
      </div>

      <Separator className="my-6" />

      {commentsQuery.isLoading ? (
        <CommentThreadSkeleton />
      ) : commentsQuery.isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-4 text-destructive" />

            <div>
              <p className="text-sm font-medium">
                Unable to load comments
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Something went wrong while loading this discussion.
              </p>

              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => commentsQuery.refetch()}
              >
                Try again
              </Button>
            </div>
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <MessageSquare className="mx-auto mb-3 size-7 text-muted-foreground" />

          <p className="text-sm font-medium">
            No comments yet
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Be the first to start the conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              isSubmitting={createCommentMutation.isPending}
              isUpdating={updateCommentMutation.isPending}
              isDeleting={deleteCommentMutation.isPending}
              onReply={(commentId, body) =>
                handleCreate(body, commentId)
              }
              onEdit={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {meta && (
        <CommentPagination
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          isPending={commentsQuery.isFetching}
          onPageChange={handlePageChange}
        />
      )}
    </section>
  );
}

function CommentThreadSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="size-8 rounded-full" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}