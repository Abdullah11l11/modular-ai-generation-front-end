import { apiClient } from '@/lib/api/client';
import type { Id, PaginatedResponse, PaginationParams, Project } from '@/types/api';
export const getUserProjects = (userId: Id, params?: PaginationParams) =>
  apiClient.get<PaginatedResponse<Project>>(`users/${userId}/projects`, { params });
