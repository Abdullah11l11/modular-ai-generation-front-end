import { useMutation, useQueryClient } from '@tanstack/react-query';
import { register } from '@/features/auth/api/register';
import type { RegisterRequest } from '@/features/auth/types/registerRequest';
import { apiClient } from '@/lib/api/client';

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterRequest) => register(payload),
    onSuccess: (response) => {
      apiClient.auth.setToken(response.token);
      queryClient.setQueryData(['me'], response.user);
    },
  });
};
