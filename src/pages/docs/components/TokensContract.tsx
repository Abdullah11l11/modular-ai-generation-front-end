import type { ReactNode } from 'react';
import { Reveal } from '@/components/reveal';

/**
 * Section 3 of `/docs` — "Every layer speaks the same tokens."
 *
 * Three token-category cards (color / space / shape + type) each
 * showing a small visual sample of representative tokens. The point:
 * change the token, change every layer. No CSS hand-written per slide.
 */
export function TokensContract() {
  return (
    <section
      aria-labelledby="docs-tokens-heading"
      className="relative border-t border-(--bor2)/40 bg-gradient-to-b from-transparent via-(--sur2)/30 to-transparent py-[30px]"
    >
      <div className="mx-auto max-w-(--container-main) px-(--space-page-x)">
        <Reveal>
          <p className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
            02 / Standard tokens
          </p>
          <h2
            id="docs-tokens-heading"
            className="mt-3 max-w-3xl text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-bold tracking-tight text-(--t1)"
          >
            Every layer speaks the same tokens.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-(--t2)">
            Tokens are the contract. A generator emits class names;
            the framework resolves them through the project's tokens.
            Change one token and every layer retunes itself.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Reveal delayMs={80}>
            <TokenCard
              category="Color"
              tokenName="--mgf-color-accent"
              description="One variable retunes links, charts, dots, and highlights across every layer."
              sample={<ColorSample />}
            />
          </Reveal>
          <Reveal delayMs={160}>
            <TokenCard
              category="Space"
              tokenName="--mgf-space-*"
              description="A consistent rhythm — 2 / 4 / 8 / 16 — that keeps every component in step."
              sample={<SpaceSample />}
            />
          </Reveal>
          <Reveal delayMs={240}>
            <TokenCard
              category="Shape & Type"
              tokenName="--mgf-radius-*"
              description="Corners and faces — radius, font-display, font-mono — set the project's voice."
              sample={<ShapeSample />}
            />
          </Reveal>
        </div>

        <Reveal delayMs={320}>
          <p className="mt-10 max-w-3xl text-sm leading-relaxed text-(--t2)">
            Three layers, one vocabulary. The token contract is what lets
            them compose without colliding.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function TokenCard({
  category,
  tokenName,
  description,
  sample,
}: {
  category: string;
  tokenName: string;
  description: string;
  sample: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded-(--radius-card) border border-(--bor2)/40 bg-(--sur) p-5 shadow-sm ring-1 ring-(--bor2)/50 transition-all duration-150 hover:-translate-y-px hover:shadow-md">
      <div className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
        {category}
      </div>
      <div className="mt-1 font-(--font-mono) text-xs text-(--t2)">{tokenName}</div>
      <div className="mt-4 rounded-lg bg-(--bg) p-4 ring-1 ring-(--bor2)/40">{sample}</div>
      <p className="mt-4 text-sm leading-relaxed text-(--t2)">{description}</p>
    </div>
  );
}

function ColorSample() {
  return (
    <div className="space-y-3">
      <Swatch token="--mgf-color-accent" value="#22D3EE" />
      <Swatch token="--mgf-color-bg" value="#0b0f17" />
      <Swatch token="--mgf-color-text-primary" value="#f4f6fa" />
    </div>
  );
}

function Swatch({
  token,
  value,
}: {
  token: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="size-6 rounded-md ring-1 ring-(--bor2)/60"
        style={{ background: value }}
      />
      <span className="font-(--font-mono) text-[11px] text-(--t2)">{token}</span>
      <span className="ml-auto font-(--font-mono) text-[10px] text-(--t3)">{value}</span>
    </div>
  );
}

function SpaceSample() {
  return (
    <div className="space-y-2">
      {[2, 4, 8, 16].map((step, i) => (
        <div key={step} className="flex items-center gap-3">
          <div
            className="rounded-sm bg-(--cy)"
            style={{ width: `${step * 4}px`, height: '8px', opacity: 0.4 + i * 0.15 }}
          />
          <span className="font-(--font-mono) text-[11px] text-(--t2)">
            --mgf-space-{step}
          </span>
          <span className="ml-auto font-(--font-mono) text-[10px] text-(--t3)">
            {step * 0.25}rem
          </span>
        </div>
      ))}
    </div>
  );
}

function ShapeSample() {
  return (
    <div className="grid grid-cols-3 items-end gap-3">
      <Shape label="sm" radius={4} />
      <Shape label="md" radius={10} />
      <Shape label="lg" radius={16} />
    </div>
  );
}

function Shape({ label, radius }: { label: string; radius: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="size-10 bg-(--cy)/30 ring-1 ring-(--cy)"
        style={{ borderRadius: `${radius}px`, background: 'color-mix(in srgb, var(--cy) 25%, transparent)' }}
      />
      <span className="font-(--font-mono) text-[10px] text-(--t3)">--mgf-radius-{label}</span>
    </div>
  );
}