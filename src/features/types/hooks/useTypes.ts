import { useQuery } from '@tanstack/react-query'
import { listTypes } from '@/features/types/api/listTypes'

export const useTypes = () =>
  useQuery({
    queryKey: ['types'],
    queryFn: listTypes,
  })
