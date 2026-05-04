import { useQuery } from '@tanstack/react-query'
import { listTemplates } from '@/features/templates/api/listTemplates'
import type { TemplateListParams } from '@/features/templates/types/templateListParams'

export const useTemplates = (params?: TemplateListParams) =>
  useQuery({
    queryKey: ['templates', params],
    queryFn: () => listTemplates(params),
  })
