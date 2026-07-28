import { useMutation } from '@tanstack/react-query'
import { createAiProvider } from '@/features/me/api/createAiProvider'
import type { UpsertAiProviderRequest } from '@/features/me/types/upsertAiProviderRequest'

export const useCreateAiProvider = () =>
  useMutation({
    mutationFn: (payload: UpsertAiProviderRequest) =>
      createAiProvider(payload),
  })
