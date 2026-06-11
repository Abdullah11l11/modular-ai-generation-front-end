import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '@/features/auth/api/login';
import type { LoginRequest } from '@/features/auth/types/loginRequest';
import { apiClient } from '@/lib/api/client';
import { useNavigate } from 'react-router-dom';
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (response) => {
      navigate('/');
      apiClient.auth.setToken(response.token);
      queryClient.setQueryData(['me'], response.user);
    },
  });
};
