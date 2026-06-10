import { Outlet } from "react-router-dom";

export function EditorLayout() {
  return (
    <div className="flex h-screen flex-col bg-[var(--bg)] font-sans text-[var(--t1)]">
      <header className="flex h-(--space-nav) shrink-0 items-center gap-3 border-b border-[var(--bor2)] bg-[var(--sur)] px-(--space-page-x)">
        <span className="grid size-5 grid-cols-2 gap-px">
          <span className="rounded-[2px] bg-[var(--cy)]" />
          <span className="rounded-[2px] bg-[var(--cy)] opacity-70" />
          <span className="rounded-[2px] bg-[var(--cy)] opacity-40" />
          <span className="rounded-[2px] bg-[var(--cy)] opacity-20" />
        </span>
        <span className="text-sm font-bold tracking-tight">MGF Editor</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[200px] shrink-0 border-r border-[var(--bor2)] bg-[var(--sur)] p-3 overflow-y-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--t3)]">
            Slides
          </div>
        </aside>

        <main className="flex flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>

        <aside className="w-[270px] shrink-0 border-l border-[var(--bor2)] bg-[var(--sur)] p-3 overflow-y-auto">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--t3)]">
            Properties
          </div>
        </aside>
      </div>
    </div>
  );
}
