import { apiClient } from '@/lib/api/client';

export const logout = () => apiClient.post<void>('auth/logout');
