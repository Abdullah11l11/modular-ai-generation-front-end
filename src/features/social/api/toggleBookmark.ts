import type { SocialTarget } from '@/features/social/types/socialTarget';
import { apiClient } from '@/lib/api/client';
import type { Id, ToggleResponse } from '@/types/api';

export const toggleBookmark = (target: SocialTarget, targetId: Id) =>
  apiClient.post<ToggleResponse>(`${target}/${targetId}/bookmark`);
