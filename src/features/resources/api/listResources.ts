import type { ResourceListParams } from '@/features/resources/types/resourceListParams'
import { apiClient } from '@/lib/api/client'
import type { PaginatedResponse, Resource } from '@/types/api'

export const listResources = (params?: ResourceListParams) =>
  apiClient.get<PaginatedResponse<Resource>>('resources', { params })
