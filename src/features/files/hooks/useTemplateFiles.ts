import { useQuery } from '@tanstack/react-query'
import { listTemplateFiles } from '@/features/files/api/listTemplateFiles'
import type { Id } from '@/types/api'

export const useTemplateFiles = (templateId: Id) =>
  useQuery({
    queryKey: ['templates', templateId, 'files'],
    queryFn: () => listTemplateFiles(templateId),
  })
