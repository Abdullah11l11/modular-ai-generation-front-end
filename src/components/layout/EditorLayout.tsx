import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FullPageLoader } from '@/components/full-page-loader';
import { ErrorBoundary } from '@/components/error-boundary';

export function EditorLayout() {
  return (
    <div className="flex h-screen flex-col bg-(--bg) font-sans text-(--t1)">
      <header className="flex h-(--space-nav) shrink-0 items-center gap-3 border-b border-(--bor2) bg-(--sur) px-(--space-page-x)">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-bold tracking-tight text-(--t1) no-underline"
        >
          <span className="grid size-5 grid-cols-2 gap-px">
            <span className="rounded-xs bg-(--cy)" />
            <span className="rounded-xs bg-(--cy) opacity-70" />
            <span className="rounded-xs bg-(--cy) opacity-40" />
            <span className="rounded-xs bg-(--cy) opacity-20" />
          </span>
          MGF Editor
        </Link>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <ErrorBoundary>
          <Suspense fallback={<FullPageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
