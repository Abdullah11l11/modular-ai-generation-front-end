import { useMutation } from '@tanstack/react-query'
import { updateAiProvider } from '@/features/me/api/updateAiProvider'
import type { UpsertAiProviderRequest } from '@/features/me/types/upsertAiProviderRequest'
import type { Id } from '@/types/api'

export const useUpdateAiProvider = () =>
  useMutation({
    mutationFn: ({
      providerId,
      payload,
    }: {
      providerId: Id
      payload: UpsertAiProviderRequest
    }) => updateAiProvider(providerId, payload),
  })
