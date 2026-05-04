import { useMutation } from '@tanstack/react-query'
import { updateResource } from '@/features/resources/api/updateResource'
import type { UpdateResourceRequest } from '@/features/resources/types/updateResourceRequest'
import type { Id } from '@/types/api'

export const useUpdateResource = () =>
  useMutation({
    mutationFn: ({
      resourceId,
      payload,
    }: {
      resourceId: Id
      payload: UpdateResourceRequest
    }) => updateResource(resourceId, payload),
  })
