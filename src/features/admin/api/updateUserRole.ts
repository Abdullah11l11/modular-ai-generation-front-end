import { apiClient } from '@/lib/api/client';
import type { Id, User } from '@/types/api';
import type { UpdateUserRoleRequest } from '@/features/admin/types/updateRoleRequest';

export const updateUserRole = (userId: Id, role: User['role']) =>
  apiClient.put<User, UpdateUserRoleRequest>(`admin/users/${userId}`, {
    role,
  });
