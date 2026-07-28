import type { CreateCommentRequest } from '@/features/social/types/createCommentRequest'
import { apiClient } from '@/lib/api/client'
import type { Comment, Id } from '@/types/api'

export const updateComment = (commentId: Id, payload: CreateCommentRequest) =>
  apiClient.put<Comment, CreateCommentRequest>(
    `comments/${commentId}`,
    payload,
  )
