import type { TemplateListParams } from '@/features/templates/types/templateListParams';
import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse, Template } from '@/types/api';

export const listTemplates = (params?: TemplateListParams) =>
  apiClient.get<PaginatedResponse<Template>>('templates', { params });
