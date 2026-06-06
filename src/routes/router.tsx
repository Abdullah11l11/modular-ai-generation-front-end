import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/auth/login";
export const router = createBrowserRouter([
  { path: "/", element: <></> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <></> },
  { path: "/templates", element: <></> },
  { path: "/templates/:templateId", element: <></> },
  { path: "/dashboard", element: <></> },
  { path: "/editor/projects/:projectId", element: <></> },
  { path: "/settings", element: <></> },
  { path: "/resources", element: <></> },
  { path: "/resources/new", element: <></> },
  { path: "/resources/:resourceId", element: <></> },
  { path: "/users/:userId", element: <></> },
  { path: "/admin/*", element: <></> },
  { path: "*", element: <></> },
]);
