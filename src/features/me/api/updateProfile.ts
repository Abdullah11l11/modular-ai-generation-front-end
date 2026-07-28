import type { UpdateProfileRequest } from '@/features/me/types/updateProfileRequest'
import { apiClient } from '@/lib/api/client'
import type { User } from '@/types/api'

export const updateProfile = (payload: UpdateProfileRequest) =>
  apiClient.put<User, UpdateProfileRequest>('me/profile', payload)
