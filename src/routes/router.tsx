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
import { CreateTemplatePage } from '@/pages/templates/CreateTemplatePage';
import { DocsPage } from '@/pages/docs/DocsPage';
import { SkillPage } from '@/pages/skill/SkillPage';
import AiProvidersPage from '@/pages/settings/AiProvidersPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { ResourcePage } from '@/pages/resources/resourcesPage';
import { ResourceDetailPage } from '@/pages/resources/ResourceDetailPage';
import { CreateResourcePage } from '@/pages/resources/CreateResourcePage';
import { AIGenerateProjectPage } from '@/pages/newProject/AIGenerateProjectPage';
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
      { path: '/docs', element: <DocsPage /> },
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
          { path: '/settings', element: <SettingsPage /> },
          { path: '/settings/ai-providers', element: <AiProvidersPage /> },
          { path: '/resources', element: <ResourcePage /> },
          { path: '/resources/new', element: <CreateResourcePage /> },
          { path: '/resources/:resourceId', element: <ResourceDetailPage /> },
          { path: '/templates/new', element: <CreateTemplatePage /> },
          { path: '/skill', element: <SkillPage /> },
          { path: '/projects/new/ai', element: <AIGenerateProjectPage /> },
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
