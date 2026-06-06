import { apiClient } from '@/lib/api/client'
import type { User } from '@/types/api'

export const getMe = () => apiClient.get<User>('auth/me')
