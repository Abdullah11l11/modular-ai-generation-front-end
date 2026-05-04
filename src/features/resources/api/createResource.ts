import type { CreateResourceRequest } from '@/features/resources/types/createResourceRequest'
import { apiClient } from '@/lib/api/client'
import type { Resource } from '@/types/api'

export const createResource = (payload: CreateResourceRequest) =>
  apiClient.post<Resource, CreateResourceRequest>('resources', payload)
