import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse, User } from '@/types/api';
import type { AdminUsersParams } from '@/features/admin/types/adminUsersParams';

export const listAdminUsers = (params?: AdminUsersParams) =>
  apiClient.get<PaginatedResponse<User>>('admin/users', { params });
