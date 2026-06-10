import type { AuthResponse } from '@/features/auth/types/authResponse';
import type { RegisterRequest } from '@/features/auth/types/registerRequest';
import { apiClient } from '@/lib/api/client';

export const register = (payload: RegisterRequest) =>
  apiClient.post<AuthResponse, RegisterRequest>('auth/register', payload);
