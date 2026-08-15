import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createComment } from '../api/createComment';
import { socialKeys } from './useComments';

import type { CreateCommentRequest } from '../types/createCommentRequest';
import type {SocialTarget} from '@/features/social/types/socialTarget';

interface CreateCommentVariables {
  target: SocialTarget;
  targetId: string;
  payload: CreateCommentRequest;
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      target,
      targetId,
      payload,
    }: CreateCommentVariables) =>
      createComment(target, targetId, payload),

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