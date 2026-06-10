import { apiClient } from '@/lib/api/client';
import type { OutputType } from '@/types/api';

export const listTypes = () => apiClient.get<OutputType[]>('types');
