import { useQuery } from '@tanstack/react-query';
import { getUserTemplates } from '@/features/users/api/getUserTemplates';
import type { Id, PaginationParams } from '@/types/api';

export const useUserTemplates = (userId: Id, params?: PaginationParams) =>
  useQuery({
    queryKey: ['users', userId, 'templates', params],
    queryFn: () => getUserTemplates(userId, params),
  });
