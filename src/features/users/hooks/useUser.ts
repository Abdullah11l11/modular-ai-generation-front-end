import { useQuery } from '@tanstack/react-query'
import { getUser } from '@/features/users/api/getUser'
import type { Id } from '@/types/api'

export const useUser = (userId: Id) =>
  useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUser(userId),
  })
