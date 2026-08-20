import type { SocialTarget } from '@/features/social/types/socialTarget';
import { apiClient } from '@/lib/api/client';
import type { BookmarkResponse, Id } from '@/types/api';

export const toggleBookmark = (target: SocialTarget, targetId: Id) =>
  apiClient.post<BookmarkResponse>(`${target}/${targetId}/bookmark`);
