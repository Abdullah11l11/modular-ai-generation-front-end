import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { listTemplates } from '@/features/templates/api/listTemplates';
import type { TemplateListParams } from '@/features/templates/types/templateListParams';
import type { PaginatedResponse, Template } from '@/types/api';

type Options = Omit<UseQueryOptions<PaginatedResponse<Template>>, 'queryKey' | 'queryFn'>;

export const useTemplates = (
  params: TemplateListParams = {},
  options: Options = {},
) =>
  useQuery<PaginatedResponse<Template>>({
    queryKey: ['templates', params],
    queryFn: () => listTemplates(params),
    ...options,
  });
