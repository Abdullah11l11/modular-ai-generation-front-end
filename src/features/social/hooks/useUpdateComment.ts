import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateComment } from '@/features/social/api/updateComment';
import type { CreateCommentRequest } from '@/features/social/types/createCommentRequest';
import type { SocialTarget } from '@/features/social/types/socialTarget';
import type { Id } from '@/types/api';

export const useUpdateComment = (target: SocialTarget, targetId: Id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, payload }: { commentId: Id; payload: CreateCommentRequest }) =>
      updateComment(commentId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [target, targetId, 'comments'] });
    },
  });
};
