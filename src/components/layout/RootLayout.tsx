import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { FullPageLoader } from '@/components/full-page-loader';
import { ErrorBoundary } from '@/components/error-boundary';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-(--bg) text-(--t1) font-sans">
      <Navbar />
      <main
        className="mx-auto px-(--space-page-x) py-6"
        style={{ maxWidth: 'var(--container-main)' }}
      >
        <ErrorBoundary>
          <Suspense fallback={<FullPageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
