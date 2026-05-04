import { useMutation } from '@tanstack/react-query'
import { createTemplate } from '@/features/templates/api/createTemplate'
import type { CreateTemplateRequest } from '@/features/templates/types/createTemplateRequest'

export const useCreateTemplate = () =>
  useMutation({
    mutationFn: (payload: CreateTemplateRequest) => createTemplate(payload),
  })
