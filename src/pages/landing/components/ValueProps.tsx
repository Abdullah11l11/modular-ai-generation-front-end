import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VALUE_PROPS = [
  {
    eyebrow: '01',
    title: 'AI brief → project',
    body: 'Describe what you want. Get a full styled deck in under a minute — files, theme, copy, all generated.',
    icon: SparkleIcon,
  },
  {
    eyebrow: '02',
    title: 'Style without CSS',
    body: 'Theme tokens make every slide on-brand without a stylesheet. One source of truth, every layer follows.',
    icon: LayersIcon,
  },
  {
    eyebrow: '03',
    title: 'Start from a template',
    body: 'Browse community-built decks, fork them, and make them yours. No blank-page paralysis.',
    icon: GridIcon,
  },
  {
    eyebrow: '04',
    title: 'Reusable resources',
    body: 'Prompts, skills, rules, and agents shared by the community. Wire them in and ship faster.',
    icon: PlugIcon,
  },
];

/**
 * Four-card value-prop grid. Pure copy + lightweight inline icons — no
 * data fetch. Icons are simple SVG paths so we don't pull in a library
 * just for a marketing page.
 */
export function ValueProps() {
  return (
    <section
      aria-labelledby="value-props-heading"
      className="relative border-t border-(--bor2)/40 bg-gradient-to-b from-transparent via-(--sur2)/30 to-transparent py-24 md:py-32"
    >
      <div className="mx-auto max-w-(--container-main) px-(--space-page-x)">
        <div className="mb-12 flex flex-col gap-3 md:mb-16">
          <span className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
            Why MGF
          </span>
          <h2
            id="value-props-heading"
            className="max-w-2xl text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-bold tracking-tight text-(--t1)"
          >
            A generator, a style system, and a community in one place.
          </h2>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map(({ eyebrow, title, body, icon: Icon }) => (
            <li key={title}>
              <Card
                size="sm"
                className="h-full border-(--bor2)/40 bg-(--sur) transition-all hover:-translate-y-px hover:shadow-md"
              >
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-(--font-mono) text-[11px] tracking-wider text-(--t3) uppercase">
                      {eyebrow}
                    </span>
                    <Icon />
                  </div>
                  <CardTitle className="text-base text-(--t1)">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-(--t2)">{body}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SparkleIcon() {
  return (
    <svg
      aria-hidden
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--cy)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
      <path d="M19 14l.7 2.1L22 17l-2.3.9L19 20l-.7-2.1L16 17l2.3-.9z" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      aria-hidden
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--cy)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 12 12 17 22 12" />
      <polyline points="2 17 12 22 22 17" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      aria-hidden
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--cy)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function PlugIcon() {
  return (
    <svg
      aria-hidden
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--cy)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22v-5" />
      <path d="M9 7V2" />
      <path d="M15 7V2" />
      <path d="M6 13V8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4z" />
    </svg>
  );
}