import { apiClient } from '@/lib/api/client';

import type { PaginatedResponse, Resource } from '@/types/api';

import type { AdminResourcesParams } from '@/features/admin/types/adminResourcesParams';

export const listAdminResources = (params?: AdminResourcesParams) =>
  apiClient.get<PaginatedResponse<Resource>>('admin/resources', { params });
