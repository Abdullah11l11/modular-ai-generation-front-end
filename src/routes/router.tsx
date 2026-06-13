import { createBrowserRouter } from 'react-router-dom';
import { AuthLayout, EditorLayout, RootLayout } from '@/components/layout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoute } from '@/routes/AdminRoute';
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/Register';
import { PublicProfilePage } from '@/pages/PublicProfilePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import { EditorPage } from '@/features/editor/components/EditorPage';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <EditorLayout />,
        children: [{ path: '/editor/projects/:projectId', element: <EditorPage /> }],
      },
    ],
  },
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <></> },
      { path: '/templates', element: <></> },
      { path: '/templates/:templateId', element: <></> },
      { path: '/users/:userId', element: <PublicProfilePage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/settings', element: <></> },
          { path: '/resources', element: <></> },
          { path: '/resources/new', element: <></> },
          { path: '/resources/:resourceId', element: <></> },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [{ path: '/admin/*', element: <></> }],
      },
    ],
  },
  {
    element: <RootLayout />,
    children: [{ path: '*', element: <NotFoundPage /> }],
  },
]);
