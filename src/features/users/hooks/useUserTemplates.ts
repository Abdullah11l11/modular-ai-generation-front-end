import { useQuery } from '@tanstack/react-query';
import { getUserTemplates } from '@/features/users/api/getUserTemplates';
import type { Id } from '@/types/api';

export const useUserTemplates = (userId: Id) =>
  useQuery({
    queryKey: ['users', userId, 'templates'],
    queryFn: () => getUserTemplates(userId),
  });
