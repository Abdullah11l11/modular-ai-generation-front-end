import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/features/me/api/getMe'

export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  })
