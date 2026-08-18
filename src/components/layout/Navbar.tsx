import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { AuthControl } from '@/components/layout/AuthControl';

const navLinks = [
  { to: '/templates', label: 'Browse' },
  { to: '/resources', label: 'Resources' },
  { to: '/docs', label: 'Docs' },
];

export function Navbar() {
  const { pathname } = useLocation();
  const { isDark, toggle } = useTheme();

  return (
    <nav
      className="sticky top-0 z-100 flex h-(--space-nav) items-center gap-3 border-b border-[var(--bor)] bg-[var(--sur)] px-(--space-page-x)"
      style={{ backdropFilter: 'blur(6px)' }}
    >
      <Link
        to="/"
        className="flex items-center gap-2 font-bold text-sm tracking-tight text-[var(--t1)] no-underline"
      >
        <span className="grid size-5 grid-cols-2 gap-px">
          <span className="rounded-[2px] bg-[var(--cy)]" />
          <span className="rounded-[2px] bg-[var(--cy)] opacity-70" />
          <span className="rounded-[2px] bg-[var(--cy)] opacity-40" />
          <span className="rounded-[2px] bg-[var(--cy)] opacity-20" />
        </span>
        MGF
      </Link>

      <span className="inline-block h-[18px] w-px bg-[var(--bor2)]" />

      <div className="flex items-center gap-1">
        {navLinks.map(({ to, label }) => {
          const isActive = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`rounded-[var(--r8)] px-3 py-1.5 text-xs font-medium no-underline transition-colors duration-150 ${
                isActive
                  ? 'bg-[var(--sur2)] text-[var(--t1)]'
                  : 'text-[var(--t2)] hover:bg-[var(--sur2)] hover:text-[var(--t1)]'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggle}
          className="flex size-8 items-center justify-center rounded-[var(--r8)] border border-[var(--bor2)] bg-[var(--sur)] text-[var(--t2)] transition-colors duration-150 hover:border-[var(--bor)] hover:text-[var(--t1)]"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <span className="inline-block h-[18px] w-px bg-[var(--bor2)]" />

        <AuthControl />
      </div>
    </nav>
  );
}
