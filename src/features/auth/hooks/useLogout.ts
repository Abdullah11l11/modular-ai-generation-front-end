import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '@/features/auth/api/logout';
import { apiClient } from '@/lib/api/client';
import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      apiClient.auth.clearToken();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
};
