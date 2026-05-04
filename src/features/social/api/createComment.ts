import type { CreateCommentRequest } from '@/features/social/types/createCommentRequest'
import type { SocialTarget } from '@/features/social/types/socialTarget'
import { apiClient } from '@/lib/api/client'
import type { Comment, Id } from '@/types/api'

export const createComment = (
  target: SocialTarget,
  targetId: Id,
  payload: CreateCommentRequest,
) =>
  apiClient.post<Comment, CreateCommentRequest>(
    `${target}/${targetId}/comments`,
    payload,
  )
