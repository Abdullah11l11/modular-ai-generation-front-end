import { useMutation } from '@tanstack/react-query'
import { forkTemplate } from '@/features/templates/api/forkTemplate'
import type { ForkTemplateRequest } from '@/features/templates/types/forkTemplateRequest'
import type { Id } from '@/types/api'

export const useForkTemplate = () =>
  useMutation({
    mutationFn: ({
      templateId,
      payload,
    }: {
      templateId: Id
      payload: ForkTemplateRequest
    }) => forkTemplate(templateId, payload),
  })
