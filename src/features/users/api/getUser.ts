import { apiClient } from '@/lib/api/client';
import type { Id, User } from '@/types/api';

export const getUser = (userId: Id) =>
  apiClient.get<{ data: User }>(`users/${userId}`).then((res) => res.data);
