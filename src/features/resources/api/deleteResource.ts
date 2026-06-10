import { apiClient } from '@/lib/api/client';
import type { Id } from '@/types/api';

export const deleteResource = (resourceId: Id) => apiClient.delete(`resources/${resourceId}`);
