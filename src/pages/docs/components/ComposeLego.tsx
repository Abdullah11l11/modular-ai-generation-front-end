import { Reveal } from '@/components/reveal';

/**
 * Section 4 of `/docs` — "CSS for this + CSS for that = one whole."
 *
 * The lego metaphor: a slide's CSS isn't one hand-written file, it's
 * the assembly of independent `.mgf-*` rules that each consume tokens.
 *
 * Left column: prose.
 * Right column: a vertical stack of CSS fragment cards connected by
 * thin "+" connectors, leading to a final composed example.
 */
export function ComposeLego() {
  return (
    <section
      aria-labelledby="docs-lego-heading"
      className="relative border-t border-(--bor2)/40 py-[30px]"
    >
      <div className="mx-auto max-w-(--container-main) px-(--space-page-x)">
        <Reveal>
          <p className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
            03 / Compose, don't write
          </p>
          <h2
            id="docs-lego-heading"
            className="mt-3 max-w-3xl text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-bold tracking-tight text-(--t1)"
          >
            CSS for this + CSS for that = one whole.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-12">
          <Reveal delayMs={80}>
            <div className="space-y-4 text-base leading-relaxed text-(--t2)">
              <p>
                A slide's CSS isn't a single hand-written file. It's the
                assembly of independent <span className="font-(--font-mono) text-(--t1)">.mgf-*</span>{' '}
                rules — each one small, each one owning its own concern.
              </p>
              <p>
                Snap the card rule to the layout rule, snap the chart
                rule to the type rule, snap the spacing scale to the
                radius scale. Every brick reads from the token contract,
                so nothing collides. Replacing one brick doesn't disturb
                the others.
              </p>
              <p>
                That's why a template can be re-skinned by changing three
                tokens — and why the same vocabulary composes slides,
                dashboards, sites, and timelines alike.
              </p>
            </div>
          </Reveal>

          <Reveal delayMs={160}>
            <div className="space-y-3">
              {BRICKS.map((brick, i) => (
                <div key={brick.title}>
                  <BrickCard brick={brick} />
                  {i < BRICKS.length - 1 && <PlusConnector />}
                </div>
              ))}
              <EqualsConnector />
              <ComposedCard />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

type Brick = {
  title: string;
  cssClass: string;
  cssBody: string;
  accent: 'structure' | 'style' | 'content';
};

const BRICKS: Brick[] = [
  {
    title: 'Surface',
    cssClass: '.mgf-card',
    cssBody: 'background: var(--mgf-color-surface);\nborder: 1px solid var(--mgf-color-border);\nborder-radius: var(--mgf-radius-md);',
    accent: 'style',
  },
  {
    title: 'Layout',
    cssClass: '.mgf-stat-group',
    cssBody: 'display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: var(--mgf-space-4);',
    accent: 'structure',
  },
  {
    title: 'Chart',
    cssClass: '.mgf-chart-bar',
    cssBody: 'fill: var(--mgf-color-accent);\nwidth: var(--mgf-space-2);\nheight: var(--val);',
    accent: 'content',
  },
];

function BrickCard({ brick }: { brick: Brick }) {
  const accentColor = `var(--layer-${brick.accent})`;
  return (
    <div
      className="relative rounded-(--radius-card) border border-(--bor2)/40 bg-(--sur) p-4 shadow-sm transition-all duration-150 hover:-translate-y-px hover:shadow-md"
      style={{ borderLeftWidth: '3px', borderLeftColor: accentColor }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-(--font-mono) text-[11px] tracking-wider uppercase" style={{ color: accentColor }}>
          {brick.title}
        </span>
        <span className="font-(--font-mono) text-[10px] text-(--t3)">brick</span>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-(--bg) p-3 font-(--font-mono) text-[11px] leading-relaxed text-(--t2) ring-1 ring-(--bor2)/40">
{`${brick.cssClass} {
  ${brick.cssBody}
}`}
      </pre>
    </div>
  );
}

function PlusConnector() {
  return (
    <div aria-hidden className="flex justify-center">
      <div className="grid size-7 place-items-center rounded-full bg-(--cy-d) text-(--cy) ring-1 ring-(--cy-b)/40">
        <span className="font-(--font-mono) text-base leading-none">+</span>
      </div>
    </div>
  );
}

function EqualsConnector() {
  return (
    <div aria-hidden className="flex items-center gap-2 py-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-(--bor2)/60 to-transparent" />
      <span className="font-(--font-mono) text-xs text-(--t3)">=</span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-(--bor2)/60 to-transparent" />
    </div>
  );
}

function ComposedCard() {
  return (
    <div className="relative rounded-(--radius-card) border border-(--cy)/40 bg-(--cy-d) p-4 shadow-sm transition-all duration-150 hover:-translate-y-px hover:shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
          composed
        </span>
        <span className="font-(--font-mono) text-[10px] text-(--t3)">whole</span>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-(--bg) p-3 font-(--font-mono) text-[11px] leading-relaxed text-(--t1) ring-1 ring-(--cy-b)/50">
{`<div class="mgf-card mgf-stat-group">
  <div class="mgf-stat">
    <span class="mgf-chart-bar" style="--val: 80%"></span>
    <span class="mgf-stat-label">MoM growth</span>
  </div>
  ...
</div>`}
      </pre>
    </div>
  );
}