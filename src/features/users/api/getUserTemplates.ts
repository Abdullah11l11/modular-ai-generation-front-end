import { apiClient } from '@/lib/api/client';
import type { Id, PaginatedResponse, PaginationParams, Template } from '@/types/api';

export const getUserTemplates = (userId: Id, params?: PaginationParams) =>
  apiClient.get<PaginatedResponse<Template>>(`users/${userId}/templates`, { params });
