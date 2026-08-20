import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/features/me/api/getMe';

const authTokenKey = 'mgf.authToken';
const getToken = () => window.localStorage.getItem(authTokenKey);

export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !!getToken(),
  });
