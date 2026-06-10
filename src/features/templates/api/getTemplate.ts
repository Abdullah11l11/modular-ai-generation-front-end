import { apiClient } from '@/lib/api/client';
import type { Id, Template } from '@/types/api';

export const getTemplate = (templateId: Id) => apiClient.get<Template>(`templates/${templateId}`);
