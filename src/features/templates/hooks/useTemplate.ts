import { useQuery } from '@tanstack/react-query';
import { getTemplate } from '@/features/templates/api/getTemplate';
import type { Id } from '@/types/api';

export const useTemplate = (templateId: Id) =>
  useQuery({
    queryKey: ['templates', templateId],
    queryFn: () => getTemplate(templateId),
  });
