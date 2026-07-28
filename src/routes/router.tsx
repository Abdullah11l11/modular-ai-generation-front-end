import { createBrowserRouter } from 'react-router-dom'
// import AdminGuard  from "src/routes/AdminGuard";
import { AdminLayout } from '@/features/admin/components/layout/AdminLayout';
import { AdminGuard } from '@/routes/AdminGuard';
export const router = createBrowserRouter([
  { path: '/', element: <></> },
  { path: '/login', element: <></> },
  { path: '/register', element: <></> },
  { path: '/templates', element: <></> },
  { path: '/templates/:templateId', element: <></> },
  { path: '/dashboard', element: <></> },
  { path: '/editor/projects/:projectId', element: <></> },
  { path: '/settings', element: <></> },
  { path: '/resources', element: <></> },
  { path: '/resources/new', element: <></> },
  { path: '/resources/:resourceId', element: <></> },
  { path: '/users/:userId', element: <></> },
  { path: '/admin/*', element: <AdminGuard>
<AdminLayout/>
</AdminGuard> },
  { path: '*', element: <></> }

])

