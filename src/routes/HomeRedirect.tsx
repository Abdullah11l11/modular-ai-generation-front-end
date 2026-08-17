import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { FullPageLoader } from '@/components/full-page-loader';

/**
 * Landing route for `/`. Sends the user somewhere useful based on auth state:
 *   - Authenticated → `/dashboard` (so they land on "My Projects" instead of
 *     a blank page)
 *   - Not authenticated → `/templates` (the public catalogue — gives them
 *     something to browse before they sign in)
 *
 * Shows a tiny loader while `useMe` resolves so we don't bounce an
 * authenticated user through `/templates` then to `/dashboard`.
 */
export function HomeRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageLoader label="Loading..." />;
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/templates'} replace />;
}
