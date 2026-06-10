import { useQuery } from '@tanstack/react-query';
import { listComments } from '@/features/social/api/listComments';
import type { SocialTarget } from '@/features/social/types/socialTarget';
import type { Id } from '@/types/api';

export const useComments = (target: SocialTarget, targetId: Id) =>
  useQuery({
    queryKey: [target, targetId, 'comments'],
    queryFn: () => listComments(target, targetId),
  });
