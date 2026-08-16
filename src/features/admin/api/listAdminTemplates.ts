import { apiClient } from '@/lib/api/client';

import type { PaginatedResponse, Template } from '@/types/api';

import type { AdminTemplatesParams } from '@/features/admin/types/adminTemplatesParams';

export const listAdminTemplates = (params?: AdminTemplatesParams) =>
  apiClient.get<PaginatedResponse<Template>>('admin/templates', { params });
