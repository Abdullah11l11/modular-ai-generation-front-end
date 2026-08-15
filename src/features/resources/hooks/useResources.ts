import { useQuery } from '@tanstack/react-query';
import { listResources } from '@/features/resources/api/listResources';
import type { ResourceListParams } from '@/features/resources/types/resourceListParams';

export const useResources = (params?: ResourceListParams) =>
  useQuery({
    queryKey: ['resources', params],
    queryFn: () => listResources(params),
  });
