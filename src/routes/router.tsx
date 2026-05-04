import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminPage } from '@/pages/AdminPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { EditorPage } from '@/pages/EditorPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NewResourcePage } from '@/pages/NewResourcePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ResourceDetailPage } from '@/pages/ResourceDetailPage'
import { ResourcesPage } from '@/pages/ResourcesPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { TemplateDetailPage } from '@/pages/TemplateDetailPage'
import { TemplatesPage } from '@/pages/TemplatesPage'
import { UserProfilePage } from '@/pages/UserProfilePage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/templates', element: <TemplatesPage /> },
      { path: '/templates/:templateId', element: <TemplateDetailPage /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/editor/projects/:projectId', element: <EditorPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/resources', element: <ResourcesPage /> },
      { path: '/resources/new', element: <NewResourcePage /> },
      { path: '/resources/:resourceId', element: <ResourceDetailPage /> },
      { path: '/users/:userId', element: <UserProfilePage /> },
      { path: '/admin/*', element: <AdminPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
