import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse, User } from '@/types/api';

export const listAdminUsers = () => apiClient.get<PaginatedResponse<User>>('admin/users');
