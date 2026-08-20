import LandingPage from '@/pages/landing';

/**
 * Landing route for `/`. Renders the public marketing landing page
 * for everyone — visitors see "Get started" / "Sign in", authenticated
 * users see "Open dashboard" / "Generate with AI". The dashboard is
 * still reachable from the account dropdown (see `AuthControl`).
 */
export function HomeRedirect() {
  return <LandingPage />;
}