import { apiClient } from '@/lib/api/client';
import type { Id, PaginatedResponse, ProjectFile } from '@/types/api';

export const listTemplateFiles = (templateId: Id) =>
  apiClient.get<PaginatedResponse<ProjectFile>>(`templates/${templateId}/files`);
