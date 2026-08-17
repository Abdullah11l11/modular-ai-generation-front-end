import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteComment } from '@/features/social/api/deleteComment';
import type { SocialTarget } from '@/features/social/types/socialTarget';
import type { Id } from '@/types/api';

export const useDeleteComment = (target: SocialTarget, targetId: Id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: Id) => deleteComment(commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [target, targetId, 'comments'] });
    },
  });
};
