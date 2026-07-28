import { useMutation } from '@tanstack/react-query'
import { toggleBookmark } from '@/features/social/api/toggleBookmark'
import type { SocialTarget } from '@/features/social/types/socialTarget'
import type { Id } from '@/types/api'

export const useToggleBookmark = () =>
  useMutation({
    mutationFn: ({
      target,
      targetId,
    }: {
      target: SocialTarget
      targetId: Id
    }) => toggleBookmark(target, targetId),
  })
