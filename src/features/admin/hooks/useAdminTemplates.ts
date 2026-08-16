import { useQuery } from '@tanstack/react-query';

import { listAdminTemplates } from '@/features/admin/api/listAdminTemplates';

import type { AdminTemplatesParams } from '@/features/admin/types/adminTemplatesParams';

export const useAdminTemplates = (params?: AdminTemplatesParams) =>
  useQuery({
    queryKey: ['admin', 'templates', params],
    queryFn: () => listAdminTemplates(params),
  });
