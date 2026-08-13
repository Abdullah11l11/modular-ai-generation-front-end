import { apiClient } from '@/lib/api/client';
import type { Id } from '@/types/api';

export const deleteTemplate = (templateId: Id) => apiClient.delete(`templates/${templateId}`);
