import { useMutation, useQueryClient } from '@tanstack/react-query';
import { register } from '@/features/auth/api/register';
import type { RegisterRequest } from '@/features/auth/types/registerRequest';
import { apiClient } from '@/lib/api/client';
import { useNavigate } from 'react-router-dom';
import { toastSuccess, toastError } from '@/lib/toast';

export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterRequest) => register(payload),
    onSuccess: (response) => {
      apiClient.auth.setToken(response.token);
      queryClient.setQueryData(['me'], response.user);
      toastSuccess(`Account created, welcome ${response.user.name}`);
      navigate('/', { replace: true });
    },
    onError: () => {
      toastError('Registration failed. Please try again.');
    },
  });
};
