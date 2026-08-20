import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FullPageLoader } from '@/components/full-page-loader';
import { ErrorBoundary } from '@/components/error-boundary';

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-(--bg) text-(--t1) font-sans">
      <Navbar />
      <main
        className="mx-auto w-full flex-1 px-(--space-page-x) py-6"
        style={{ maxWidth: 'var(--container-main)' }}
      >
        <ErrorBoundary>
          <Suspense fallback={<FullPageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
