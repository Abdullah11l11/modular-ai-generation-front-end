import { Navigate } from 'react-router-dom';
import { useMe } from '@/features/me/hooks/useMe';
import { FullPageLoader } from '@/components/full-page-loader';

export function ProfileRedirect() {
  const { data: user, isLoading } = useMe();

  if (isLoading || !user) {
    return <FullPageLoader />;
  }

  return <Navigate to={`/users/${user.id}`} replace />;
}
