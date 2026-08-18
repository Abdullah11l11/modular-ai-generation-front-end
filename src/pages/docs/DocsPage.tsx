import { PhilosophyHero } from './components/PhilosophyHero';
import { LayersFlow } from './components/LayersFlow';
import { TokensContract } from './components/TokensContract';
import { ComposeLego } from './components/ComposeLego';
import { ExtendAnything } from './components/ExtendAnything';
import { DocsFinalCTA } from './components/DocsFinalCTA';

/**
 * Public `/docs` page — explains how the modular framework thinks.
 *
 * Six sections, each wrapped in `<Reveal>` for scroll-triggered fade-up:
 *   1. PhilosophyHero   — headline + layered stack preview
 *   2. LayersFlow       — brief → three layers
 *   3. TokensContract   — every layer speaks the same tokens
 *   4. ComposeLego      — CSS bricks snap into one whole
 *   5. ExtendAnything   — video + music prove the language is open
 *   6. DocsFinalCTA     — start composing
 *
 * Same art language as `LandingPage` (same tokens, same eyebrows, same
 * card patterns, same glow decorations).
 */
export function DocsPage() {
  return (
    <div className="flex flex-col">
      <PhilosophyHero />
      <LayersFlow />
      <TokensContract />
      <ComposeLego />
      <ExtendAnything />
      <DocsFinalCTA />
    </div>
  );
}