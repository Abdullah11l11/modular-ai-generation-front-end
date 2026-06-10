import { apiClient } from '@/lib/api/client';
import type { Id, PaginatedResponse, Resource } from '@/types/api';

export const listResourceForks = (resourceId: Id) =>
  apiClient.get<PaginatedResponse<Resource>>(`resources/${resourceId}/forks`);
