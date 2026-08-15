import { apiClient } from '@/lib/api/client';
import type { Id, Resource } from '@/types/api';

export const getResource = (resourceId: Id) => apiClient.get<Resource>(`resources/${resourceId}`);
