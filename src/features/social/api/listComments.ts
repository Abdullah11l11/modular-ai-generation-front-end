import type { SocialTarget } from '@/features/social/types/socialTarget';
import { apiClient } from '@/lib/api/client';
import type { Comment, Id, PaginatedResponse } from '@/types/api';

export const listComments = (target: SocialTarget, targetId: Id) =>
  apiClient.get<PaginatedResponse<Comment>>(`${target}/${targetId}/comments`);
