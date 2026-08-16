import { useQuery } from '@tanstack/react-query';
import { listAdminUsers } from '@/features/admin/api/listAdminUsers';
import type { AdminUsersParams } from '@/features/admin/types/adminUsersParams';

export const useAdminUsers = (params?: AdminUsersParams) =>
  useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => listAdminUsers(params),
  });
