import type { UpdateResourceRequest } from '@/features/resources/types/updateResourceRequest'
import { apiClient } from '@/lib/api/client'
import type { Id, Resource } from '@/types/api'

export const updateResource = (
  resourceId: Id,
  payload: UpdateResourceRequest,
) =>
  apiClient.put<Resource, UpdateResourceRequest>(
    `resources/${resourceId}`,
    payload,
  )
