import { createBrowserRouter } from 'react-router-dom';
import { AuthLayout, EditorLayout, RootLayout } from '@/components/layout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoute } from '@/routes/AdminRoute';
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/Register';
import { PublicProfilePage } from '@/pages/PublicProfilePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import EditorPage from '@/pages/editor/EditorPage';
import { TemplatesPage } from '@/pages/templates/TemplatesPage';
import AiProvidersPage from '@/pages/settings/AiProvidersPage';
import { ResourcePage } from '@/pages/resources/resourcesPage';
import { ResourceDetailPage } from '@/pages/resources/ResourceDetailPage';
import AdminPage from '@/pages/admin/AdminPage';
import { ProfileRedirect } from '@/routes/ProfileRedirect';
import { TemplateDetailPage } from '@/pages/templates/TemplateDetailPage';
import { HomeRedirect } from '@/routes/HomeRedirect';

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
      { path: '/', element: <HomeRedirect /> },
      { path: '/templates', element: <TemplatesPage /> },
      { path: '/templates/:templateId', element: <TemplateDetailPage /> },
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
          { path: '/me', element: <ProfileRedirect /> },
          { path: '/settings', element: <></> },
          { path: '/settings/ai-providers', element: <AiProvidersPage /> },
          { path: '/resources', element: <ResourcePage /> },
          { path: '/resources/new', element: <></> },
          { path: '/resources/:resourceId', element: <ResourceDetailPage /> },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          {
            path: '/admin/*',
            element: (
              <>
                <AdminPage />
              </>
            ),
          },
        ],
      },
    ],
  },
  {
    element: <RootLayout />,
    children: [{ path: '*', element: <NotFoundPage /> }],
  },
]);
