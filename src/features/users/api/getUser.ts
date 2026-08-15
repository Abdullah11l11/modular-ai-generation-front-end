import { apiClient } from '@/lib/api/client';
import type { Id, User } from '@/types/api';

export const getUser = (userId: Id) => apiClient.get<User>(`users/${userId}`);
