import { useMutation } from '@tanstack/react-query'
import { updateTemplate } from '@/features/templates/api/updateTemplate'
import type { UpdateTemplateRequest } from '@/features/templates/types/updateTemplateRequest'
import type { Id } from '@/types/api'

export const useUpdateTemplate = () =>
  useMutation({
    mutationFn: ({
      templateId,
      payload,
    }: {
      templateId: Id
      payload: UpdateTemplateRequest
    }) => updateTemplate(templateId, payload),
  })
