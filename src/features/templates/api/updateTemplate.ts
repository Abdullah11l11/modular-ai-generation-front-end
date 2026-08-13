import type { UpdateTemplateRequest } from '@/features/templates/types/updateTemplateRequest';
import { apiClient } from '@/lib/api/client';
import type { Id, Template } from '@/types/api';

export const updateTemplate = (templateId: Id, payload: UpdateTemplateRequest) =>
  apiClient.put<Template, UpdateTemplateRequest>(`templates/${templateId}`, payload);
