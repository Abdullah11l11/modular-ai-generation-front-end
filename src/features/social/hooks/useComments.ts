import { useQuery } from '@tanstack/react-query';

import { listComments } from '../api/listComments';
import type { CommentListParams } from '../types/commentListParams';
import type { SocialTarget } from '@/features/social/types/socialTarget';

export const socialKeys = {
  all: ['social'] as const,

  comments: (
    target: SocialTarget,
    targetId: string,
    params: CommentListParams,
  ) =>
    [
      ...socialKeys.all,
      'comments',
      target,
      targetId,
      params.page ?? 1,
      params.per_page ?? 20,
    ] as const,
};

export function useComments(
  target: SocialTarget,
  targetId: string,
  params: CommentListParams = {},
) {
  return useQuery({
    queryKey: socialKeys.comments(target, targetId, params),

    queryFn: () => listComments(target, targetId, params),

    enabled: Boolean(targetId),

    staleTime: 30_000,
  });
}