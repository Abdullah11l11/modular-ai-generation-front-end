import { useMutation } from '@tanstack/react-query';
import { updateProfile } from '@/features/me/api/updateProfile';
import type { UpdateProfileRequest } from '@/features/me/types/updateProfileRequest';

export const useUpdateProfile = () =>
  useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateProfile(payload),
  });
