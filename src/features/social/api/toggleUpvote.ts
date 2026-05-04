import type { SocialTarget } from '@/features/social/types/socialTarget'
import { apiClient } from '@/lib/api/client'
import type { Id, ToggleResponse } from '@/types/api'

export const toggleUpvote = (target: SocialTarget, targetId: Id) =>
  apiClient.post<ToggleResponse>(`${target}/${targetId}/upvote`)
