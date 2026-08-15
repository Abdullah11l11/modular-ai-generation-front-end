import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteComment } from '../api/deleteComment';
import { socialKeys } from './useComments';

interface DeleteCommentVariables {
  commentId: string;
  target: 'templates' | 'resources';
  targetId: string;
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: DeleteCommentVariables) =>
      deleteComment(commentId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: socialKeys.comments(
          variables.target,
          variables.targetId,
          {},
        ).slice(0, 4),
      });
    },
  });
}