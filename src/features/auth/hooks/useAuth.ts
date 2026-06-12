import { useMe } from '@/features/me/hooks/useMe';

const authTokenKey = 'mgf.authToken';

const getToken = () => window.localStorage.getItem(authTokenKey);

export function useAuth() {
  const token = getToken();
  const meQuery = useMe();

  return {
    user: meQuery.data ?? null,
    isAuthenticated: !!token,
    isLoading: !!token && meQuery.isLoading,
    token,
  };
}

export function hasToken(): boolean {
  return !!getToken();
}
