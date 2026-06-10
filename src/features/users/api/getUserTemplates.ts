import { apiClient } from '@/lib/api/client';
import type { Id, PaginatedResponse, Template } from '@/types/api';

export const getUserTemplates = (userId: Id) =>
  apiClient.get<PaginatedResponse<Template>>(`users/${userId}/templates`);
