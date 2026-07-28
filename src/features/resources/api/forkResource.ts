import type { ForkResourceRequest } from '@/features/resources/types/forkResourceRequest'
import { apiClient } from '@/lib/api/client'
import type { Id, Resource } from '@/types/api'

export const forkResource = (resourceId: Id, payload?: ForkResourceRequest) =>
  apiClient.post<Resource, ForkResourceRequest | undefined>(
    `resources/${resourceId}/fork`,
    payload,
  )
