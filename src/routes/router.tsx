import { createBrowserRouter } from 'react-router-dom';
import { AuthLayout, EditorLayout, RootLayout } from '@/components/layout';
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/Register';
import { PublicProfilePage } from '@/pages/PublicProfilePage';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <EditorLayout />,
    children: [{ path: '/editor/projects/:projectId', element: <></> }],
  },
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <></> },
      { path: '/templates', element: <></> },
      { path: '/templates/:templateId', element: <></> },
      { path: '/dashboard', element: <></> },
      { path: '/settings', element: <></> },
      { path: '/resources', element: <></> },
      { path: '/resources/new', element: <></> },
      { path: '/resources/:resourceId', element: <></> },
      { path: '/users/:userId', element: <PublicProfilePage /> },
      { path: '/admin/*', element: <></> },
      { path: '*', element: <></> },
    ],
  },
]);
