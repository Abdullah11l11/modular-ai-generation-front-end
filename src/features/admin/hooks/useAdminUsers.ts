import { useQuery } from '@tanstack/react-query'
import { listAdminUsers } from '@/features/admin/api/listAdminUsers'

export const useAdminUsers = () =>
  useQuery({
    queryKey: ['admin', 'users'],
    queryFn: listAdminUsers,
  })
