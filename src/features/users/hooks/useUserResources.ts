import { useQuery } from '@tanstack/react-query';
import { getUserResources } from '@/features/users/api/getUserResources';
import type { Id, PaginationParams } from '@/types/api';

export const useUserResources = (userId: Id, params?: PaginationParams) =>
  useQuery({
    queryKey: ['users', userId, 'resources', params],
    queryFn: () => getUserResources(userId, params),
  });
