import type { CreateTemplateRequest } from '@/features/templates/types/createTemplateRequest';
import { apiClient } from '@/lib/api/client';
import type { Template } from '@/types/api';

export const createTemplate = (payload: CreateTemplateRequest) =>
  apiClient.post<Template, CreateTemplateRequest>('templates', payload);
