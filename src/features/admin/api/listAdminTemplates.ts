import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse, Template } from '@/types/api';

export const listAdminTemplates = () =>
  apiClient.get<PaginatedResponse<Template>>('admin/templates');
