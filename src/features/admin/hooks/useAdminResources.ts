import { useQuery } from '@tanstack/react-query';

import { listAdminResources } from '@/features/admin/api/listAdminResources';

import type { AdminResourcesParams } from '@/features/admin/types/adminResourcesParams';

export const useAdminResources = (params?: AdminResourcesParams) =>
  useQuery({
    queryKey: ['admin', 'resources', params],
    queryFn: () => listAdminResources(params),
  });
