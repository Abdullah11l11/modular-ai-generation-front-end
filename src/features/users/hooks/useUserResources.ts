import { useQuery } from '@tanstack/react-query'
import { getUserResources } from '@/features/users/api/getUserResources'
import type { Id } from '@/types/api'

export const useUserResources = (userId: Id) =>
  useQuery({
    queryKey: ['users', userId, 'resources'],
    queryFn: () => getUserResources(userId),
  })
