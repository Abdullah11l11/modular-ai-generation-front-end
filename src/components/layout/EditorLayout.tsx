import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { FullPageLoader } from '@/components/full-page-loader';
import { ErrorBoundary } from '@/components/error-boundary';

export function EditorLayout() {
  return (
    <div className="flex h-screen flex-col bg-(--bg) font-sans text-(--t1)">
      <header className="flex h-(--space-nav) shrink-0 items-center gap-3 border-b border-(--bor2) bg-(--sur) px-(--space-page-x)">
        <span className="grid size-5 grid-cols-2 gap-px">
          <span className="rounded-xs bg-(--cy)" />
          <span className="rounded-xs bg-(--cy) opacity-70" />
          <span className="rounded-xs bg-(--cy) opacity-40" />
          <span className="rounded-xs bg-(--cy) opacity-20" />
        </span>
        <span className="text-sm font-bold tracking-tight">MGF Editor</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-50 shrink-0 border-r border-(--bor2) bg-(--sur) p-3 overflow-y-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-(--t3)">Slides</div>
        </aside>

        <main className="flex flex-1 flex-col overflow-hidden">
          <ErrorBoundary>
            <Suspense fallback={<FullPageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>

        <aside className="w-67.5 shrink-0 border-l border-(--bor2) bg-(--sur) p-3 overflow-y-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-(--t3)">
            Properties
          </div>
        </aside>
      </div>
    </div>
  );
}
