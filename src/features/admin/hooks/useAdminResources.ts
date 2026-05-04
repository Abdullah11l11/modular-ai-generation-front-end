import { useQuery } from '@tanstack/react-query'
import { listAdminResources } from '@/features/admin/api/listAdminResources'

export const useAdminResources = () =>
  useQuery({
    queryKey: ['admin', 'resources'],
    queryFn: listAdminResources,
  })
