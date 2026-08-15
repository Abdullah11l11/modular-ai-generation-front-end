import { useMutation } from '@tanstack/react-query';
import { toggleUpvote } from '@/features/social/api/toggleUpvote';
import type { SocialTarget } from '@/features/social/types/socialTarget';
import type { Id } from '@/types/api';

export const useToggleUpvote = () =>
  useMutation({
    mutationFn: ({ target, targetId }: { target: SocialTarget; targetId: Id }) =>
      toggleUpvote(target, targetId),
  });
