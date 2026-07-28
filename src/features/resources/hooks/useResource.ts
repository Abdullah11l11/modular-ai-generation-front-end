import { useQuery } from '@tanstack/react-query'
import { getResource } from '@/features/resources/api/getResource'
import type { Id } from '@/types/api'

export const useResource = (resourceId: Id) =>
  useQuery({
    queryKey: ['resources', resourceId],
    queryFn: () => getResource(resourceId),
  })
