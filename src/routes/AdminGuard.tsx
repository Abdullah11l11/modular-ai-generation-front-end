import { Navigate, Outlet } from 'react-router-dom';
import { useMe } from '@/features/me/hooks/useMe';
export function AdminGuard() {
  const { data: user, isLoading, isError } = useMe();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user || isError) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
