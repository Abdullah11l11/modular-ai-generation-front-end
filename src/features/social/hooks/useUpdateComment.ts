import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  updateComment,
  type UpdateCommentRequest,
} from '../api/updateComment';

import { socialKeys } from './useComments';

interface UpdateCommentVariables {
  commentId: string;
  target: 'templates' | 'resources';
  targetId: string;
  payload: UpdateCommentRequest;
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      payload,
    }: UpdateCommentVariables) =>
      updateComment(commentId, payload),

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