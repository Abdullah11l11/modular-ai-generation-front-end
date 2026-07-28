import { useMutation, useQueryClient } from '@tanstack/react-query'
import { login } from '@/features/auth/api/login'
import type { LoginRequest } from '@/features/auth/types/loginRequest'
import { apiClient } from '@/lib/api/client'

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (response) => {
      apiClient.auth.setToken(response.token)
      queryClient.setQueryData(['me'], response.user)
    },
  })
}
