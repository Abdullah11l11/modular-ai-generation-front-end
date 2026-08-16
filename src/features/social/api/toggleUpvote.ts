import type { SocialTarget } from '@/features/social/types/socialTarget';
import { apiClient } from '@/lib/api/client';
import type { Id, UpvoteResponse } from '@/types/api';

export const toggleUpvote = (target: SocialTarget, targetId: Id) =>
  apiClient.post<UpvoteResponse>(`${target}/${targetId}/upvote`);
