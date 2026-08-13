import { apiClient } from '@/lib/api/client';
import type { Id, PaginatedResponse, PaginationParams, Resource } from '@/types/api';

export const getUserResources = (userId: Id, params?: PaginationParams) =>
  apiClient.get<PaginatedResponse<Resource>>(`users/${userId}/resources`, { params });
