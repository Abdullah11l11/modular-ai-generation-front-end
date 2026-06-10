import { apiClient } from '@/lib/api/client';
import type { Id, PaginatedResponse, Resource } from '@/types/api';

export const getUserResources = (userId: Id) =>
  apiClient.get<PaginatedResponse<Resource>>(`users/${userId}/resources`);
