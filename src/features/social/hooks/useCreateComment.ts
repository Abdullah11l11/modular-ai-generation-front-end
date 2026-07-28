import { useMutation } from '@tanstack/react-query'
import { createComment } from '@/features/social/api/createComment'
import type { CreateCommentRequest } from '@/features/social/types/createCommentRequest'
import type { SocialTarget } from '@/features/social/types/socialTarget'
import type { Id } from '@/types/api'

export const useCreateComment = () =>
  useMutation({
    mutationFn: ({
      target,
      targetId,
      payload,
    }: {
      target: SocialTarget
      targetId: Id
      payload: CreateCommentRequest
    }) => createComment(target, targetId, payload),
  })
