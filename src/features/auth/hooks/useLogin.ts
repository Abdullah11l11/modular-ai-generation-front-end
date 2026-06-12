import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '@/features/auth/api/login';
import type { LoginRequest } from '@/features/auth/types/loginRequest';
import { apiClient } from '@/lib/api/client';
import { useNavigate } from 'react-router-dom';
import { toastSuccess, toastError } from '@/lib/toast';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (response) => {
      apiClient.auth.setToken(response.token);
      queryClient.setQueryData(['me'], response.user);
      toastSuccess(`Welcome back, ${response.user.name}`);
      navigate('/');
    },
    onError: () => {
      toastError('Invalid email or password');
    },
  });
};
