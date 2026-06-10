import type { AuthResponse } from '@/features/auth/types/authResponse';
import type { LoginRequest } from '@/features/auth/types/loginRequest';
import { apiClient } from '@/lib/api/client';

export const login = (payload: LoginRequest) =>
  apiClient.post<AuthResponse, LoginRequest>('auth/login', payload);
