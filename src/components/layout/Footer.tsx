import { Link } from 'react-router-dom';

const PRODUCT_LINKS = [
  { to: '/templates', label: 'Templates' },
  { to: '/resources', label: 'Resources' },
  { to: '/docs', label: 'Docs' },
  { to: '/projects/new/ai', label: 'Generate with AI' },
];

const RESOURCE_LINKS = [
  { to: '/templates', label: 'Browse templates' },
  { to: '/resources', label: 'Browse resources' },
  { to: '/users', label: 'Community' },
];

const COMPANY_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/settings/ai-providers', label: 'AI providers' },
];

/**
 * Global footer for every page under `RootLayout` (landing, templates,
 * resources, public profile, dashboard, settings, admin, 404). Lives
 * below the routed `<main>` and stays at the bottom of short pages
 * because the outer wrapper uses `flex min-h-screen flex-col`.
 *
 * Four-column layout on `lg`, two-column on `sm`, single column below.
 * Same theme tokens (`--cy`, `--sur`, `--t1`–`3`, `--bor`, `--bor2`)
 * as the rest of the app shell, so the footer respects the user's
 * dark/light toggle automatically.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-(--bor2)/40 bg-(--bg)">
      <div className="mx-auto max-w-(--container-main) px-(--space-page-x) py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
          <div className="space-y-4">
            <Link
              to="/"
              aria-label="MGF home"
              className="inline-flex items-center gap-2 font-bold text-sm tracking-tight text-(--t1) no-underline"
            >
              <span className="grid size-5 grid-cols-2 gap-px">
                <span className="rounded-[2px] bg-(--cy)" />
                <span className="rounded-[2px] bg-(--cy) opacity-70" />
                <span className="rounded-[2px] bg-(--cy) opacity-40" />
                <span className="rounded-[2px] bg-(--cy) opacity-20" />
              </span>
              MGF
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-(--t2)">
              Modular Generation Framework. Separate structure, style, and content. Ship decks,
              dashboards, and sites with AI.
            </p>
          </div>

          <FooterColumn heading="Product" links={PRODUCT_LINKS} />
          <FooterColumn heading="Resources" links={RESOURCE_LINKS} />
          <FooterColumn heading="App" links={COMPANY_LINKS} />
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-(--bor2)/40 pt-6 text-xs text-(--t3) sm:flex-row sm:items-center md:mt-12">
          <p>© {year} MGF. All rights reserved.</p>
          <p className="font-(--font-mono) tracking-wider uppercase">
            Built with modular files · open to fork
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
        {heading}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={`${heading}-${link.to}-${link.label}`}>
            <Link
              to={link.to}
              className="text-sm text-(--t2) no-underline transition-colors hover:text-(--t1)"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}