import { apiClient } from '@/lib/api/client'
import type { PaginatedResponse, Resource } from '@/types/api'

export const listAdminResources = () =>
  apiClient.get<PaginatedResponse<Resource>>('admin/resources')
