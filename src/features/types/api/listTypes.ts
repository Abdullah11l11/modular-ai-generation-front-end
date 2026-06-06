import { apiClient } from '@/lib/api/client'
import type { OutputType } from '@/types/api'

type ListTypesResponse = {
  data: OutputType[]
}

export const listTypes = () => apiClient.get<ListTypesResponse>('types')
