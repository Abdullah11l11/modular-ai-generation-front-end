import { apiClient } from '@/lib/api/client';
import type { Id, User } from '@/types/api';

export const updateUserRole = (userId: Id, role: User['role']) =>
  apiClient.put<User, { role: User['role'] }>(`admin/users/${userId}`, {
    role,
  });
