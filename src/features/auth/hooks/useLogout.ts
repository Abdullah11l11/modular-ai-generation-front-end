import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '@/features/auth/api/logout';
import { apiClient } from '@/lib/api/client';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      apiClient.auth.clearToken();
      queryClient.clear();
    },
  });
};
