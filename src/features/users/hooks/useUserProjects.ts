import { useQuery } from '@tanstack/react-query';
import { getUserProjects } from '@/features/users/api/getUserProjects';
import type { Id, PaginationParams } from '@/types/api';
export const useUserProjects = (userId: Id, params?: PaginationParams) =>
  useQuery({
    queryKey: ['users', userId, 'projects', params],
    queryFn: () => getUserProjects(userId, params),
  });
