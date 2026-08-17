/**
 * Editor BASE_CSS — the framework-side styles injected into every
 * preview. The project's own `style.css` may only define `:root` tokens
 * (`--mgf-color-*`, `--mgf-font-*`, `--mgf-text-*`, etc.) with no class
 * rules. Inject a fallback layer that gives the standard `mgf-*` classes
 * visible styling using whatever variables are defined. Variable lookups
 * fall back to sane defaults if the project CSS doesn't define them.
 *
 * `mgf-*` is the single class vocabulary — see
 * `src/lib/ai/prompts/standards/classes.md` for the full list.
 *
 * Sections (kept in this order so cascade composes top-to-bottom):
 *  1. Root defaults
 *  2. Typography + utilities
 *  3. Surfaces (deck / website / dashboard / carousel / slide sizes)
 *  4. Cards + stats + KPI
 *  5. Quote / testimonial / avatar
 *  6. Code / code-card
 *  7. Callout / list / badge / tag
 *  8. Hero / section / eyebrow / divider / accent bar / chapter num
 *  9. Nav / footer
 * 10. CTA
 * 11. Bento / marquee / spotlight / marks
 * 12. Timeline / steps / comparison
 * 13. Feature / team / table / FAQ / pricing / media
 * 14. Charts (CSS-only, zero JS)
 * 15. Background patterns + frames
 * 16. Modifiers (mgf-glass, mgf-neo, mgf-brutal-border, mgf-grain, etc.)
 * 17. Website archetype (scrollable single-page)
 * 18. Responsive collapse
 * 19. RTL flips
 */

export const BASE_CSS = `
:root { color-scheme: dark; }
html, body {
  margin: 0;
  padding: 0;
  background: var(--mgf-color-bg, #0b0f17);
  color: var(--mgf-color-text-primary, #f4f6fa);
  font-family: var(--mgf-font-body, system-ui, sans-serif);
  line-height: 1.5;
}

/* ── 2. Typography + utilities ─────────────────────────────────── */
.mgf-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.7;
  margin: 0 0 0.5rem;
}
.mgf-label-lg { font-size: 0.8125rem; }
.mgf-eyebrow {
  font-size: var(--mgf-text-xs, 0.8125rem);
  text-transform: uppercase;
  letter-spacing: var(--mgf-tracking-wide, 0.08em);
  color: var(--mgf-color-accent, #22D3EE);
  font-weight: var(--mgf-weight-medium, 500);
  margin: 0 0 var(--mgf-space-2, 0.5rem);
}
.mgf-title {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
  line-height: 1.15;
  letter-spacing: var(--mgf-tracking-tight, -0.02em);
}
.mgf-title-lg { font-size: 3.5rem; line-height: 1.1; }
.mgf-title-xl { font-size: 4.5rem; line-height: 1.05; letter-spacing: var(--mgf-tracking-tight, -0.03em); }
.mgf-subtitle { font-size: 1.125rem; line-height: 1.5; margin: 0 0 1rem; opacity: 0.85; }
.mgf-body {
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.85;
}
.mgf-body-sm { font-size: 0.875rem; line-height: 1.5; opacity: 0.8; }
.mgf-caption {
  font-size: var(--mgf-text-sm, 0.9375rem);
  color: var(--mgf-color-text-secondary, #94A3B8);
  margin: 0;
  line-height: var(--mgf-leading-normal, 1.5);
}
.mgf-mono { font-family: var(--mgf-font-mono, ui-monospace, SFMono-Regular, monospace); }
.mgf-text-accent { color: var(--mgf-color-accent, #2f80ff); }
.mgf-text-muted  { color: var(--mgf-color-text-secondary, #94a3b8); }
.mgf-text-inverse{ color: var(--mgf-color-text-inverse, #0A0E1A); }
.mgf-text-bold   { font-weight: 700; }
.mgf-text-center { text-align: center; }
.mgf-text-left   { text-align: left; }
.mgf-text-right  { text-align: right; }

/* ── 3. Surfaces (deck / website / dashboard / carousel) ─────────── */
.mgf-deck {
  max-width: 960px;
  margin: 0 auto;
}
.mgf-deck-vertical {
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-8, 2rem);
  max-width: 960px;
  margin: 0 auto;
}
.mgf-deck-dots {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  padding: var(--mgf-space-3, 0.75rem);
}
.mgf-deck-dots > span {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--mgf-color-border, rgba(255,255,255,0.2));
}
.mgf-deck-progress {
  height: 3px;
  background: var(--mgf-color-accent, #22D3EE);
  position: sticky;
  top: 0;
}
section.mgf-slide {
  padding: 2.5rem;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
.mgf-slide-size-16x9    { aspect-ratio: 16 / 9; min-height: auto; }
.mgf-slide-size-4x3     { aspect-ratio: 4 / 3;  min-height: auto; }
.mgf-slide-size-a4      { aspect-ratio: 210 / 297; min-height: auto; }
.mgf-slide-size-square  { aspect-ratio: 1 / 1;  min-height: auto; }

/* Carousel */
.mgf-carousel {
  display: flex;
  gap: var(--mgf-space-4, 1rem);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: var(--mgf-space-4, 1rem);
  scrollbar-width: thin;
}
.mgf-carousel-track {
  display: flex;
  gap: var(--mgf-space-4, 1rem);
}
.mgf-carousel-item {
  flex: 0 0 auto;
  scroll-snap-align: start;
  min-width: 280px;
}
.mgf-carousel-dots {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  padding: var(--mgf-space-2, 0.5rem);
}

/* Dashboard / 12-col grid */
.mgf-dashboard {
  padding: var(--mgf-space-6, 1.5rem);
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-6, 1.5rem);
}
.mgf-dash-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--mgf-space-4, 1rem);
}
.mgf-dash-cell {
  grid-column: span var(--col, 4);
  grid-row: span var(--row, 1);
  background: var(--mgf-color-surface, #0f1218);
  border: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  border-radius: var(--mgf-radius-lg, 12px);
  padding: var(--mgf-space-4, 1rem);
  min-height: 120px;
}
.mgf-dash-card {
  background: var(--mgf-color-surface, #0f1218);
  border: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  border-radius: var(--mgf-radius-lg, 12px);
  padding: var(--mgf-space-4, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-2, 0.5rem);
}
.mgf-widget {
  background: var(--mgf-color-surface-2, #1A2238);
  border: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  border-radius: var(--mgf-radius-md, 10px);
  padding: var(--mgf-space-4, 1rem);
}
.mgf-infographic {
  position: relative;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--mgf-space-3, 0.75rem);
  min-height: 400px;
}
.mgf-infographic-flow {
  /* Flow connectors: every child becomes a positioned unit
     with a small +cross via ::after. */
  position: relative;
}
.mgf-infographic-flow > * {
  position: relative;
}

/* ── 4. Cards + stats + KPI ──────────────────────────────────────── */
/* Multi-column containers: any element ending in -cards, -grid, or
   -columns becomes a CSS grid. The user can target 2/3/4 columns by
   suffixing -cards-2, -cards-3, -cards-4. */
.mgf-cards, .mgf-grid, .mgf-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
.mgf-cards-2, .mgf-grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.mgf-cards-3, .mgf-grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.mgf-cards-4, .mgf-grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.mgf-grid-auto { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }

/* Card surface — every element with mgf-card class gets a default
   bordered surface if the project doesn't bring its own rules. */
.mgf-card {
  background: var(--mgf-color-surface, #0f1218);
  border: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  border-radius: var(--mgf-radius-lg, 12px);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.mgf-card-solid {
  background: var(--mgf-color-surface, #0f1218);
  border: 0;
  border-radius: var(--mgf-radius-lg, 12px);
  padding: 1rem;
}
.mgf-card-hover { transition: transform 150ms ease, box-shadow 150ms ease; }
.mgf-card-hover:hover { transform: translateY(-2px); box-shadow: var(--mgf-shadow-md, 0 4px 12px rgba(0,0,0,0.25)); }
.mgf-card-accent {
  background: var(--mgf-color-surface-2, #1A2238);
  border: 1px solid var(--mgf-color-accent, #22D3EE);
  border-radius: var(--mgf-radius-lg, 18px);
  padding: var(--mgf-space-6, 1.5rem);
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-2, 0.5rem);
}
.mgf-card-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.7;
  margin: 0;
  color: var(--mgf-color-text-secondary, #94a3b8);
}
.mgf-card-value {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.mgf-card-title {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-size: 1.0625rem;
  font-weight: 700;
  margin: 0;
  color: var(--mgf-color-text-primary, #f4f6fa);
}
.mgf-card-body {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--mgf-color-text-secondary, #94a3b8);
  margin: 0;
}
.mgf-card-footer {
  font-size: 0.8125rem;
  color: var(--mgf-color-text-secondary, #94a3b8);
  margin-top: auto;
  padding-top: var(--mgf-space-2, 0.5rem);
  border-top: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
}

/* Stats: 4-up horizontal grid where each stat is a centered
   .mgf-card-accent with a large value + small label. */
.mgf-stat-group {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--mgf-space-4, 1rem);
  text-align: center;
}
.mgf-stat {
  background: var(--mgf-color-surface, #0f1218);
  border: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  border-radius: var(--mgf-radius-md, 10px);
  padding: var(--mgf-space-4, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-1, 0.25rem);
}
.mgf-stat-value {
  font-family: var(--mgf-font-display, 'Inter', system-ui, sans-serif);
  font-size: var(--mgf-text-2xl, 2.5rem);
  font-weight: var(--mgf-weight-bold, 700);
  line-height: var(--mgf-leading-tight, 1.15);
  color: var(--mgf-color-text-primary, #F4F6FA);
  margin: 0;
  font-variant-numeric: tabular-nums;
}
.mgf-stat-value-lg { font-size: clamp(2.5rem, 5vw, 4rem); }
.mgf-stat-label {
  font-size: var(--mgf-text-sm, 0.9375rem);
  color: var(--mgf-color-text-secondary, #94A3B8);
  margin: 0;
}
.mgf-stat-sub {
  font-size: 0.75rem;
  color: var(--mgf-color-text-secondary, #94a3b8);
  opacity: 0.7;
  margin: 0;
}
.mgf-kpi {
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-1, 0.25rem);
  padding: var(--mgf-space-3, 0.75rem);
}
.mgf-kpi-value {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin: 0;
  font-variant-numeric: tabular-nums;
}
.mgf-kpi-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--mgf-color-text-secondary, #94a3b8);
  margin: 0;
}

/* ── 5. Quote / testimonial / avatar ─────────────────────────────── */
.mgf-testimonial {
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-4, 1rem);
  align-items: center;
  text-align: center;
  padding: var(--mgf-space-8, 2rem);
}
.mgf-testimonial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--mgf-space-6, 1.5rem);
}
.mgf-quote {
  position: relative;
  padding-inline-start: var(--mgf-space-6, 1.5rem);
  border-inline-start: 3px solid var(--mgf-color-accent, #22D3EE);
}
.mgf-quote-text {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-size: 1.25rem;
  font-style: italic;
  line-height: 1.5;
  color: var(--mgf-color-text-primary, #f4f6fa);
  margin: 0 0 var(--mgf-space-3, 0.75rem);
}
.mgf-quote-mark {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-size: 4rem;
  line-height: 1;
  color: var(--mgf-color-accent, #22D3EE);
  opacity: 0.4;
  margin: 0;
  display: block;
}
.mgf-quote-author {
  display: flex;
  align-items: center;
  gap: var(--mgf-space-3, 0.75rem);
  margin-top: var(--mgf-space-3, 0.75rem);
}
.mgf-quote-name {
  font-weight: 700;
  color: var(--mgf-color-text-primary, #f4f6fa);
  margin: 0;
  font-size: 0.9375rem;
}
.mgf-quote-title {
  font-size: 0.8125rem;
  color: var(--mgf-color-text-secondary, #94a3b8);
  margin: 0;
}
.mgf-quote-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--mgf-color-surface-2, #1A2238);
  flex: 0 0 auto;
  overflow: hidden;
}
.mgf-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--mgf-color-surface-2, #1A2238);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex: 0 0 auto;
}
.mgf-avatar-lg { width: 64px; height: 64px; }
.mgf-avatar-xl { width: 96px; height: 96px; }

/* ── 6. Code / code-card ─────────────────────────────────────────── */
.mgf-code {
  font-family: var(--mgf-font-mono, ui-monospace, monospace);
  font-size: 0.875rem;
  background: var(--mgf-color-surface-2, #1A2238);
  padding: 0.125rem 0.375rem;
  border-radius: var(--mgf-radius-sm, 4px);
}
.mgf-code-card {
  background: var(--mgf-color-surface, #0f1218);
  border: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  border-radius: var(--mgf-radius-md, 10px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.mgf-code-card-header {
  display: flex;
  align-items: center;
  gap: var(--mgf-space-3, 0.75rem);
  padding: var(--mgf-space-2, 0.5rem) var(--mgf-space-3, 0.75rem);
  background: var(--mgf-color-surface-2, #1A2238);
  border-bottom: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
}
.mgf-code-card-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--mgf-color-text-secondary, #94a3b8);
  margin: 0;
  flex: 1;
}
.mgf-code-card-dots {
  display: flex;
  gap: 0.375rem;
}
.mgf-code-card-dots > span {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--mgf-color-border, rgba(255,255,255,0.2));
}
.mgf-code-card-body {
  margin: 0;
  padding: var(--mgf-space-4, 1rem);
  font-family: var(--mgf-font-mono, ui-monospace, monospace);
  font-size: 0.8125rem;
  line-height: 1.5;
  overflow-x: auto;
  color: var(--mgf-color-text-primary, #f4f6fa);
}
.mgf-code-lang { font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--mgf-color-text-secondary, #94a3b8); }
.mgf-code-keyword { color: #c792ea; }
.mgf-code-string  { color: #c3e88d; }
.mgf-code-comment { color: #676e95; font-style: italic; }
.mgf-code-fn      { color: #82aaff; }

/* ── 7. Callout / list / badge / tag ─────────────────────────────── */
.mgf-callout {
  background: var(--mgf-color-surface, #111726);
  border: 1px solid var(--mgf-color-border, #1F2940);
  border-radius: var(--mgf-radius-md, 10px);
  padding: var(--mgf-space-6, 1.5rem);
  margin: var(--mgf-space-4, 1rem) 0;
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-2, 0.5rem);
}
.mgf-callout-info    { border-inline-start: 3px solid var(--mgf-color-accent, #22D3EE); }
.mgf-callout-success { border-inline-start: 3px solid #22c55e; }
.mgf-callout-warning { border-inline-start: 3px solid #f59e0b; }
.mgf-callout-danger  { border-inline-start: 3px solid #ef4444; }
.mgf-callout-icon {
  font-size: 1.5rem;
  line-height: 1;
}
.mgf-callout-title {
  font-weight: 700;
  margin: 0;
  font-size: 0.9375rem;
}
.mgf-callout-text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--mgf-color-text-secondary, #94a3b8);
}

.mgf-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-2, 0.5rem);
}
.mgf-list-plain {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-1, 0.25rem);
}
.mgf-list li {
  font-size: var(--mgf-text-sm, 0.9375rem);
  color: var(--mgf-color-text-secondary, #94A3B8);
  padding-left: var(--mgf-space-4, 1rem);
  position: relative;
}
.mgf-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--mgf-color-accent, #22D3EE);
}
.mgf-list-check li::before {
  content: '✓';
  background: transparent;
  color: var(--mgf-color-accent, #22D3EE);
  font-weight: 700;
  font-size: 0.875rem;
  width: auto;
  height: auto;
  top: 0;
}
.mgf-list-number {
  list-style: decimal;
  padding-left: var(--mgf-space-6, 1.5rem);
}
.mgf-list-icon {
  list-style: none;
  padding: 0;
}

.mgf-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--mgf-color-surface-2, #1A2238);
  color: var(--mgf-color-text-primary, #f4f6fa);
  border: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
}
.mgf-badge-accent { background: var(--mgf-color-accent, #22D3EE); color: var(--mgf-color-text-inverse, #0A0E1A); border-color: transparent; }
.mgf-badge-success { background: rgba(34, 197, 94, 0.15); color: #4ade80; border-color: rgba(34, 197, 94, 0.3); }
.mgf-badge-warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3); }
.mgf-badge-muted   { background: var(--mgf-color-surface-2, #1A2238); color: var(--mgf-color-text-secondary, #94a3b8); }
.mgf-tag {
  display: inline-flex;
  padding: 0.125rem 0.5rem;
  border-radius: var(--mgf-radius-sm, 4px);
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  background: var(--mgf-color-surface-2, #1A2238);
  color: var(--mgf-color-text-secondary, #94a3b8);
}

/* ── 8. Hero / section / eyebrow / divider / accent bar / chapter ── */
.mgf-hero {
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-4, 1rem);
  padding: var(--mgf-space-12, 3rem) var(--mgf-space-6, 1.5rem);
}
.mgf-hero-media {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--mgf-color-surface-2, #1A2238);
  border-radius: var(--mgf-radius-lg, 12px);
  overflow: hidden;
}
.mgf-hero-title {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  margin: 0;
  letter-spacing: var(--mgf-tracking-tight, -0.02em);
}
.mgf-hero-sub {
  font-size: 1.125rem;
  line-height: 1.5;
  color: var(--mgf-color-text-secondary, #94a3b8);
  margin: 0;
  max-width: 640px;
}
.mgf-hero-ctas {
  display: flex;
  gap: var(--mgf-space-3, 0.75rem);
  flex-wrap: wrap;
  margin-top: var(--mgf-space-2, 0.5rem);
}

.mgf-section {
  padding: var(--mgf-space-16, 4rem) var(--mgf-space-6, 1.5rem);
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-8, 2rem);
}
.mgf-section-header {
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-2, 0.5rem);
  align-items: flex-start;
}
.mgf-section-title {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 700;
  line-height: 1.15;
  margin: 0;
}
.mgf-section-sub {
  font-size: 1rem;
  color: var(--mgf-color-text-secondary, #94a3b8);
  margin: 0;
  max-width: 640px;
}

.mgf-divider {
  width: 100%;
  height: 1px;
  background: var(--mgf-color-border, rgba(255,255,255,0.08));
  border: 0;
  margin: var(--mgf-space-8, 2rem) 0;
}
.mgf-divider-short {
  width: 60px;
  height: 2px;
  background: var(--mgf-color-accent, #22D3EE);
  border: 0;
  margin: var(--mgf-space-4, 1rem) 0;
}

.mgf-accent-bar {
  width: 3rem;
  height: 0.25rem;
  background: var(--mgf-color-accent, #2f80ff);
  margin: 0.5rem 0 1rem;
}
.mgf-accent-bar-lg {
  width: 5rem;
  height: 0.375rem;
  background: var(--mgf-color-accent, #2f80ff);
  margin: 0.5rem 0 1rem;
}

.mgf-chapter-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--mgf-color-accent, #22D3EE);
  color: var(--mgf-color-text-inverse, #0A0E1A);
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-weight: 700;
  font-size: 0.875rem;
}
.mgf-chapter-num-lg {
  width: 64px; height: 64px;
  font-size: 1.5rem;
}

/* ── 9. Nav / footer ─────────────────────────────────────────────── */
.mgf-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--mgf-space-4, 1rem) var(--mgf-space-6, 1.5rem);
  background: var(--mgf-color-surface, #0f1218);
  border-bottom: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
}
.mgf-nav-brand {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--mgf-color-text-primary, #f4f6fa);
  text-decoration: none;
}
.mgf-nav-links {
  display: flex;
  align-items: center;
  gap: var(--mgf-space-4, 1rem);
}
.mgf-nav-links a {
  color: var(--mgf-color-text-secondary, #94a3b8);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 150ms ease;
}
.mgf-nav-links a:hover { color: var(--mgf-color-text-primary, #f4f6fa); }
.mgf-footer {
  padding: var(--mgf-space-12, 3rem) var(--mgf-space-6, 1.5rem);
  border-top: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  text-align: center;
}
.mgf-footer-text {
  font-size: 0.8125rem;
  color: var(--mgf-color-text-secondary, #94a3b8);
  margin: 0;
}
.mgf-footer-links {
  display: flex;
  gap: var(--mgf-space-4, 1rem);
  justify-content: center;
  margin-top: var(--mgf-space-3, 0.75rem);
}
.mgf-footer-links a {
  font-size: 0.8125rem;
  color: var(--mgf-color-text-secondary, #94a3b8);
  text-decoration: none;
}

/* ── 10. CTA ─────────────────────────────────────────────────────── */
.mgf-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--mgf-color-accent, #22D3EE);
  text-decoration: underline;
  font-weight: 600;
  font-size: 0.9375rem;
}
.mgf-cta-solid {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--mgf-space-3, 0.75rem) var(--mgf-space-6, 1.5rem);
  background: var(--mgf-color-accent, #22D3EE);
  color: var(--mgf-color-text-inverse, #0A0E1A);
  font-family: var(--mgf-font-display, 'Inter', system-ui, sans-serif);
  font-size: var(--mgf-text-sm, 0.9375rem);
  font-weight: var(--mgf-weight-bold, 700);
  border-radius: var(--mgf-radius-md, 10px);
  text-decoration: none;
  border: 0;
  cursor: pointer;
}
.mgf-cta-lg {
  padding: var(--mgf-space-4, 1rem) var(--mgf-space-8, 2rem);
  font-size: var(--mgf-text-base, 1rem);
}

/* ── 11. Bento / marquee / spotlight / marks ─────────────────────── */
.mgf-bento {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--mgf-space-4, 1rem);
  padding: var(--mgf-space-4, 1rem);
}
.mgf-bento-item {
  grid-column: span var(--span, 4);
  background: var(--mgf-color-surface, #0f1218);
  border: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  border-radius: var(--mgf-radius-lg, 12px);
  padding: var(--mgf-space-6, 1.5rem);
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-2, 0.5rem);
}

.mgf-marquee {
  overflow: hidden;
  width: 100%;
  position: relative;
}
.mgf-marquee-track {
  display: flex;
  gap: var(--mgf-space-6, 1.5rem);
  animation: mgf-marquee-scroll 25s linear infinite;
  width: max-content;
}
.mgf-marquee-item {
  flex: 0 0 auto;
  padding: var(--mgf-space-2, 0.5rem) var(--mgf-space-4, 1rem);
  background: var(--mgf-color-surface-2, #1A2238);
  border-radius: var(--mgf-radius-md, 10px);
  font-size: 0.875rem;
  color: var(--mgf-color-text-secondary, #94a3b8);
  white-space: nowrap;
}
@keyframes mgf-marquee-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.mgf-spotlight {
  background: var(--mgf-color-surface, #0f1218);
  padding: var(--mgf-space-12, 3rem) var(--mgf-space-6, 1.5rem);
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-4, 1rem);
  position: relative;
  overflow: hidden;
}
.mgf-spotlight::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, var(--mgf-color-accent, #22D3EE) 0%, transparent 60%);
  opacity: 0.08;
  pointer-events: none;
}

.mgf-marks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--mgf-space-3, 0.75rem);
  padding: var(--mgf-space-4, 1rem);
}
.mgf-mark {
  aspect-ratio: 1;
  background: var(--mgf-color-surface, #0f1218);
  border: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  border-radius: var(--mgf-radius-md, 10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: var(--mgf-color-text-secondary, #94a3b8);
}

/* ── 12. Timeline / steps / comparison ────────────────────────── */
.mgf-timeline {
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-4, 1rem);
  position: relative;
  padding-inline-start: var(--mgf-space-6, 1.5rem);
  border-inline-start: 2px solid var(--mgf-color-border, rgba(255,255,255,0.08));
}
.mgf-timeline-item {
  position: relative;
  padding-bottom: var(--mgf-space-2, 0.5rem);
}
.mgf-timeline-dot {
  position: absolute;
  inset-inline-start: calc(var(--mgf-space-6, 1.5rem) * -1 - 5px);
  top: 0.25rem;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--mgf-color-accent, #22D3EE);
}
.mgf-timeline-content {
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-1, 0.25rem);
}

.mgf-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--mgf-space-4, 1rem);
  counter-reset: mgf-step;
}
.mgf-step {
  position: relative;
  padding: var(--mgf-space-4, 1rem);
  background: var(--mgf-color-surface, #0f1218);
  border: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  border-radius: var(--mgf-radius-md, 10px);
}
.mgf-step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--mgf-color-accent, #22D3EE);
  color: var(--mgf-color-text-inverse, #0A0E1A);
  font-weight: 700;
  font-size: 0.8125rem;
  margin-bottom: var(--mgf-space-2, 0.5rem);
}
.mgf-step-connector {
  position: absolute;
  inset-inline-end: calc(var(--mgf-space-4, 1rem) * -1);
  top: 50%;
  width: var(--mgf-space-4, 1rem);
  height: 1px;
  background: var(--mgf-color-border, rgba(255,255,255,0.2));
}

.mgf-comparison {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--mgf-space-4, 1rem);
}
.mgf-comparison-col {
  background: var(--mgf-color-surface, #0f1218);
  border: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  border-radius: var(--mgf-radius-md, 10px);
  padding: var(--mgf-space-4, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-2, 0.5rem);
}
.mgf-comparison-header {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-weight: 700;
  font-size: 1.125rem;
  margin: 0 0 var(--mgf-space-2, 0.5rem);
  padding-bottom: var(--mgf-space-2, 0.5rem);
  border-bottom: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
}

/* ── 13. Feature / team / table / FAQ / pricing / media ────────── */
.mgf-feature-icon {
  font-size: 2rem;
  line-height: 1;
  margin: 0 0 var(--mgf-space-2, 0.5rem);
}
.mgf-feature-title {
  font-family: var(--mgf-font-display, 'Inter', system-ui, sans-serif);
  font-size: var(--mgf-text-base, 1.0625rem);
  font-weight: var(--mgf-weight-bold, 700);
  color: var(--mgf-color-text-primary, #F4F6FA);
  margin: 0;
}
.mgf-feature-desc {
  font-size: var(--mgf-text-sm, 0.9375rem);
  color: var(--mgf-color-text-secondary, #94A3B8);
  line-height: var(--mgf-leading-normal, 1.5);
  margin: 0;
}

.mgf-team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--mgf-space-4, 1rem);
}
.mgf-team-member {
  background: var(--mgf-color-surface, #0f1218);
  border: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  border-radius: var(--mgf-radius-md, 10px);
  padding: var(--mgf-space-4, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-2, 0.5rem);
  align-items: center;
  text-align: center;
}
.mgf-team-name { font-weight: 700; margin: 0; color: var(--mgf-color-text-primary, #f4f6fa); }
.mgf-team-role { font-size: 0.8125rem; color: var(--mgf-color-accent, #22D3EE); margin: 0; }
.mgf-team-bio  { font-size: 0.8125rem; color: var(--mgf-color-text-secondary, #94a3b8); margin: 0; line-height: 1.5; }

.mgf-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.mgf-table th, .mgf-table td {
  padding: var(--mgf-space-2, 0.5rem) var(--mgf-space-3, 0.75rem);
  text-align: start;
  border-bottom: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
}
.mgf-table th {
  font-weight: 700;
  color: var(--mgf-color-text-primary, #f4f6fa);
  background: var(--mgf-color-surface-2, #1A2238);
}
.mgf-table tr:hover td {
  background: var(--mgf-color-surface, #0f1218);
}

.mgf-faq {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.mgf-faq-item {
  padding: var(--mgf-space-4, 1rem) 0;
  border-bottom: 1px solid var(--mgf-color-border, #1F2940);
}
.mgf-faq-item:last-child { border-bottom: none; }
.mgf-faq-q {
  font-size: var(--mgf-text-base, 1.0625rem);
  font-weight: var(--mgf-weight-bold, 700);
  color: var(--mgf-color-text-primary, #F4F6FA);
  margin: 0 0 var(--mgf-space-2, 0.5rem);
}
.mgf-faq-a {
  font-size: var(--mgf-text-sm, 0.9375rem);
  color: var(--mgf-color-text-secondary, #94A3B8);
  line-height: var(--mgf-leading-normal, 1.5);
  margin: 0;
}

.mgf-price {
  font-family: var(--mgf-font-display, 'Inter', system-ui, sans-serif);
  font-size: var(--mgf-text-2xl, 2.5rem);
  font-weight: var(--mgf-weight-bold, 700);
  color: var(--mgf-color-text-primary, #F4F6FA);
  margin: 0;
  line-height: 1.1;
}
.mgf-price-period {
  font-size: var(--mgf-text-sm, 0.9375rem);
  color: var(--mgf-color-text-secondary, #94A3B8);
  margin: 0;
}

.mgf-media {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--mgf-color-surface-2, #1A2238);
  border-radius: var(--mgf-radius-md, 10px);
  overflow: hidden;
  position: relative;
}
.mgf-media-rounded { border-radius: 50%; aspect-ratio: 1; }
.mgf-media-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mgf-color-surface-2, #1A2238);
  color: var(--mgf-color-text-secondary, #94a3b8);
  font-size: 0.875rem;
}

.mgf-slide-number {
  margin-top: auto;
  padding-top: 2rem;
  font-size: 0.875rem;
  opacity: 0.4;
  font-variant-numeric: tabular-nums;
}

/* ── 14. Charts (CSS-only, zero JS) ─────────────────────────────── */
.mgf-chart {
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-2, 0.5rem);
  padding: var(--mgf-space-4, 1rem);
  background: var(--mgf-color-surface, #0f1218);
  border: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  border-radius: var(--mgf-radius-md, 10px);
}
.mgf-chart-title {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-weight: 700;
  font-size: 0.9375rem;
  margin: 0;
  color: var(--mgf-color-text-primary, #f4f6fa);
}
.mgf-chart-legend {
  display: flex;
  gap: var(--mgf-space-3, 0.75rem);
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: var(--mgf-color-text-secondary, #94a3b8);
}
.mgf-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}
.mgf-legend-item::before {
  content: '';
  width: 10px; height: 10px;
  border-radius: 2px;
  background: var(--legend, var(--mgf-color-accent, #22D3EE));
}
.mgf-chart-svg {
  width: 100%;
  height: auto;
  display: block;
}

/* Bar (vertical) */
.mgf-chart-bar {
  display: flex;
  align-items: flex-end;
  gap: var(--mgf-space-2, 0.5rem);
  height: 200px;
  padding: var(--mgf-space-2, 0.5rem) 0;
}
.mgf-chart-bar .mgf-bar {
  flex: 1;
  height: var(--val, 0%);
  background: var(--mgf-color-accent, #22D3EE);
  border-radius: var(--mgf-radius-sm, 4px) var(--mgf-radius-sm, 4px) 0 0;
  min-height: 2px;
  transition: height 200ms ease;
}
.mgf-bar-label {
  font-size: 0.6875rem;
  color: var(--mgf-color-text-secondary, #94a3b8);
  margin-top: var(--mgf-space-1, 0.25rem);
  text-align: center;
}
.mgf-bar-value {
  font-size: 0.6875rem;
  color: var(--mgf-color-text-primary, #f4f6fa);
  margin-bottom: var(--mgf-space-1, 0.25rem);
  text-align: center;
  font-variant-numeric: tabular-nums;
}

/* Stacked bar */
.mgf-chart-stacked {
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-2, 0.5rem);
}
.mgf-bar-stack {
  display: flex;
  flex-direction: column;
  height: var(--val, 50%);
  border-radius: var(--mgf-radius-sm, 4px);
  overflow: hidden;
}
.mgf-seg {
  flex: var(--seg, 1);
  min-height: 2px;
}
.mgf-seg-1 { background: var(--mgf-color-accent, #22D3EE); }
.mgf-seg-2 { background: #fbbf24; }
.mgf-seg-3 { background: #4ade80; }
.mgf-seg-4 { background: #c084fc; }

/* Horizontal bar */
.mgf-chart-hbar {
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-2, 0.5rem);
}
.mgf-hbar {
  height: 16px;
  width: var(--val, 0%);
  background: var(--mgf-color-accent, #22D3EE);
  border-radius: var(--mgf-radius-sm, 4px);
  min-width: 2px;
  transition: width 200ms ease;
}
.mgf-hbar-label {
  font-size: 0.75rem;
  color: var(--mgf-color-text-secondary, #94a3b8);
}

/* Pie / Donut (conic-gradient) */
.mgf-chart-pie {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: var(--slices, conic-gradient(var(--mgf-color-accent, #22D3EE) 0% 50%, var(--mgf-color-surface-2, #1A2238) 50% 100%));
  position: relative;
}
.mgf-chart-donut::after {
  content: '';
  position: absolute;
  inset: 25%;
  background: var(--mgf-color-surface, #0f1218);
  border-radius: 50%;
}
.mgf-pie-center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--mgf-color-text-primary, #f4f6fa);
}

/* Heatmap */
.mgf-heatmap {
  display: grid;
  grid-template-columns: repeat(var(--cols, 7), minmax(20px, 1fr));
  gap: 2px;
  padding: var(--mgf-space-2, 0.5rem);
}
.mgf-heat-cell {
  aspect-ratio: 1;
  background: color-mix(in srgb, var(--mgf-color-accent, #22D3EE) calc(var(--heat, 0) * 100%), var(--mgf-color-surface-2, #1A2238));
  border-radius: 2px;
}

/* SVG chart containers (author SVG by hand; classes only style stroke/fill) */
.mgf-sparkline path { fill: none; stroke: var(--mgf-color-accent, #22D3EE); stroke-width: 2; }
.mgf-line path      { fill: none; stroke: var(--mgf-color-accent, #22D3EE); stroke-width: 2; }
.mgf-line .mgf-area-fill { fill: color-mix(in srgb, var(--mgf-color-accent, #22D3EE) 20%, transparent); stroke: none; }
.mgf-area path      { fill: color-mix(in srgb, var(--mgf-color-accent, #22D3EE) 30%, transparent); stroke: none; }
.mgf-gauge .mgf-gauge-needle { stroke: var(--mgf-color-text-primary, #f4f6fa); stroke-width: 2; }
.mgf-radar .mgf-radar-grid   { stroke: var(--mgf-color-border, rgba(255,255,255,0.2)); fill: none; }
.mgf-radar .mgf-radar-shape  { fill: color-mix(in srgb, var(--mgf-color-accent, #22D3EE) 30%, transparent); stroke: var(--mgf-color-accent, #22D3EE); stroke-width: 2; }
.mgf-axis-label { font-size: 0.6875rem; fill: var(--mgf-color-text-secondary, #94a3b8); }

/* ── 15. Background patterns + frames ────────────────────────────── */
/* Patterns set only background-image and layer over the project's
   --mgf-color-bg. Built with color-mix of the text color so they
   stay subtle on light AND dark themes. */
.mgf-bg-grid {
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 6%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 6%, transparent) 1px, transparent 1px);
  background-size: 32px 32px;
}
.mgf-bg-grid-fine {
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 4%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 4%, transparent) 1px, transparent 1px);
  background-size: 16px 16px;
}
.mgf-bg-grid-lg {
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 8%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 8%, transparent) 1px, transparent 1px);
  background-size: 64px 64px;
}
.mgf-bg-dots {
  background-image: radial-gradient(circle, color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 10%, transparent) 1px, transparent 1.5px);
  background-size: 24px 24px;
}
.mgf-bg-lines {
  background-image: repeating-linear-gradient(
    45deg,
    color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 4%, transparent),
    color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 4%, transparent) 1px,
    transparent 1px,
    transparent 14px
  );
}
.mgf-bg-gradient {
  background: linear-gradient(180deg, var(--mgf-color-surface, #0f1218) 0%, var(--mgf-color-bg, #0b0f17) 100%);
}
.mgf-bg-gradient-accent {
  background: linear-gradient(135deg, var(--mgf-color-accent, #22D3EE) 0%, transparent 60%);
}
.mgf-bg-surface { background: var(--mgf-color-surface, #0f1218); }
.mgf-bg-accent  { background: var(--mgf-color-accent, #22D3EE); color: var(--mgf-color-text-inverse, #0A0E1A); }
.mgf-bg-accent-soft { background: var(--mgf-color-accent-soft, rgba(34, 211, 238, 0.08)); }

/* Frames — decorative inner border for slides / hero panels with
   generous padding. Pointer-events:none so they don't intercept
   clicks. */
.mgf-frame {
  position: relative;
}
.mgf-frame::after {
  content: '';
  position: absolute;
  inset: var(--mgf-space-4, 1rem);
  border: 1px solid color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 12%, transparent);
  border-radius: var(--mgf-radius-md, 10px);
  pointer-events: none;
}
.mgf-frame-accent::after {
  border: 2px solid var(--mgf-color-accent, #22D3EE);
}
.mgf-frame-double::after {
  inset: var(--mgf-space-4, 1rem);
  border: 1px solid color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 12%, transparent);
}
.mgf-frame-double::before {
  content: '';
  position: absolute;
  inset: calc(var(--mgf-space-4, 1rem) + 6px);
  border: 1px solid color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 6%, transparent);
  border-radius: var(--mgf-radius-sm, 4px);
  pointer-events: none;
}

/* ── 16. Modifiers (compose with any theme/element) ──────────────── */
.mgf-brutal-border {
  border: 3px solid var(--mgf-color-text-primary, #f4f6fa);
  box-shadow: 6px 6px 0 var(--mgf-color-text-primary, #f4f6fa);
}
.mgf-glass {
  background: color-mix(in srgb, var(--mgf-color-surface, #0f1218) 50%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 10%, transparent);
}
.mgf-neo {
  background: var(--mgf-color-surface, #0f1218);
  border: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  box-shadow: 4px 4px 0 var(--mgf-color-text-primary, #f4f6fa);
}
.mgf-neo-inset {
  background: var(--mgf-color-surface, #0f1218);
  box-shadow: inset 3px 3px 0 color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 15%, transparent);
}
.mgf-card-glass {
  background: color-mix(in srgb, var(--mgf-color-surface, #0f1218) 50%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 10%, transparent);
  border-radius: var(--mgf-radius-lg, 12px);
  padding: 1rem;
}
.mgf-card-neo {
  background: var(--mgf-color-surface, #0f1218);
  border: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  box-shadow: 4px 4px 0 var(--mgf-color-text-primary, #f4f6fa);
  border-radius: var(--mgf-radius-md, 10px);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.mgf-grain {
  position: relative;
}
.mgf-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='10' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  opacity: 0.6;
  mix-blend-mode: overlay;
}
.mgf-grain-heavy::after { opacity: 0.9; }
.mgf-grain-soft::after { opacity: 0.3; }
.mgf-grain-none::after { display: none; }
.mgf-ambient-glow {
  position: relative;
  isolation: isolate;
}
.mgf-ambient-glow::before {
  content: '';
  position: absolute;
  inset: -20%;
  background: radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--mgf-color-accent, #22D3EE) 30%, transparent), transparent 60%);
  z-index: -1;
  pointer-events: none;
}
.mgf-dense { --mgf-space-4: 0.5rem; --mgf-space-6: 0.75rem; --mgf-space-8: 1rem; }
.mgf-air   { --mgf-space-4: 1.5rem; --mgf-space-6: 2.5rem; --mgf-space-8: 4rem; }
.mgf-hi    { filter: contrast(1.15) saturate(1.1); }
.mgf-lo    { filter: contrast(0.85) saturate(0.9); }
.mgf-accent-1 { color: var(--mgf-color-accent, #22D3EE); }
.mgf-accent-2 { color: var(--mgf-color-accent-2, #fbbf24); }
.mgf-display-serif { font-family: var(--mgf-font-serif, Georgia, serif); }
.mgf-display-mono  { font-family: var(--mgf-font-mono, ui-monospace, monospace); }
.mgf-body-serif    { font-family: var(--mgf-font-serif, Georgia, serif); }
.mgf-body-mono     { font-family: var(--mgf-font-mono, ui-monospace, monospace); }
.mgf-flat {
  box-shadow: none !important;
  filter: none;
}

/* ── 17. Website archetype (scrollable single-page) ────────────────
   The website builder emits layout.html (the page chrome — nav +
   footer + {{slides}} slot) but no layout.css. The classes below
   therefore live in the editor-side BASE_CSS so every assembled
   preview has rules for them. The full vocabulary is documented in
   src/lib/ai/prompts/standards/website.md.
   ────────────────────────────────────────────────────────────────── */

.mgf-website {
  background: var(--mgf-color-bg, #0b0f17);
  color: var(--mgf-color-text-primary, #f4f6fa);
  min-height: 100vh;
  font-family: var(--mgf-font-body, system-ui, sans-serif);
  line-height: var(--mgf-leading-normal, 1.5);
}
.mgf-website-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--mgf-space-4, 1rem) var(--mgf-space-8, 2rem);
  background: rgba(11, 15, 23, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
}
.mgf-website-brand {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-weight: var(--mgf-weight-bold, 700);
  font-size: var(--mgf-text-lg, 1.25rem);
  color: var(--mgf-color-text-primary, #f4f6fa);
  text-decoration: none;
}
.mgf-website-links {
  display: flex;
  align-items: center;
  gap: var(--mgf-space-6, 1.5rem);
}
.mgf-website-links a {
  color: var(--mgf-color-text-secondary, #94a3b8);
  text-decoration: none;
  font-size: var(--mgf-text-sm, 0.875rem);
  font-weight: var(--mgf-weight-medium, 500);
  transition: color 150ms ease;
}
.mgf-website-links a:hover { color: var(--mgf-color-text-primary, #f4f6fa); }
.mgf-website-footer {
  padding: var(--mgf-space-12, 3rem) var(--mgf-space-8, 2rem);
  border-top: 1px solid var(--mgf-color-border, rgba(255,255,255,0.08));
  text-align: center;
}

.mgf-website-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--mgf-space-24, 6rem) var(--mgf-space-8, 2rem);
  max-width: 960px;
  margin: 0 auto;
}
.mgf-website-hero-title {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-size: clamp(2.5rem, 5vw, var(--mgf-text-4xl, 5rem));
  font-weight: var(--mgf-weight-bold, 700);
  line-height: var(--mgf-leading-tight, 1.15);
  letter-spacing: var(--mgf-tracking-tight, -0.03em);
  margin: var(--mgf-space-4, 1rem) 0;
  color: var(--mgf-color-text-primary, #f4f6fa);
}
.mgf-website-hero-sub {
  font-size: var(--mgf-text-lg, 1.25rem);
  line-height: var(--mgf-leading-normal, 1.5);
  color: var(--mgf-color-text-secondary, #94a3b8);
  max-width: 640px;
  margin: 0 0 var(--mgf-space-8, 2rem);
}
.mgf-website-hero-ctas {
  display: flex;
  align-items: center;
  gap: var(--mgf-space-6, 1.5rem);
  flex-wrap: wrap;
  justify-content: center;
}

.mgf-website-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--mgf-space-24, 6rem) var(--mgf-space-8, 2rem);
}
.mgf-website-section-header {
  text-align: center;
  margin-bottom: var(--mgf-space-12, 3rem);
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-3, 0.75rem);
  align-items: center;
}
.mgf-website-section-title {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-size: var(--mgf-text-3xl, 3.5rem);
  font-weight: var(--mgf-weight-bold, 700);
  line-height: var(--mgf-leading-tight, 1.15);
  letter-spacing: var(--mgf-tracking-tight, -0.03em);
  margin: 0;
  color: var(--mgf-color-text-primary, #f4f6fa);
}
.mgf-website-section-sub {
  font-size: var(--mgf-text-lg, 1.25rem);
  color: var(--mgf-color-text-secondary, #94a3b8);
  margin: 0;
  max-width: 640px;
}
.mgf-website-testimonial {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--mgf-space-6, 1.5rem);
}
.mgf-website-faq {
  max-width: 720px;
  margin: 0 auto;
}
.mgf-website-cta {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--mgf-space-3, 0.75rem);
}
.mgf-website-cta-title {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-size: var(--mgf-text-3xl, 3.5rem);
  font-weight: var(--mgf-weight-bold, 700);
  line-height: var(--mgf-leading-tight, 1.15);
  margin: 0;
  color: var(--mgf-color-text-primary, #f4f6fa);
}
.mgf-website-cta-body {
  font-size: var(--mgf-text-lg, 1.25rem);
  color: var(--mgf-color-text-secondary, #94a3b8);
  margin: 0;
  max-width: 540px;
}

/* Make sure the section-level stats/pricing grids sit nicely inside
   the wide 1200px section container. */
.mgf-website-section .mgf-stat-group { gap: var(--mgf-space-8, 2rem); }
.mgf-website-section .mgf-grid-4 { gap: var(--mgf-space-6, 1.5rem); }
.mgf-website-section .mgf-grid-3 { gap: var(--mgf-space-6, 1.5rem); }

/* ── 18. Responsive collapse ────────────────────────────────────── */
.mgf-mt-sm { margin-top: var(--mgf-space-2, 0.5rem); }
.mgf-mt-md { margin-top: var(--mgf-space-4, 1rem); }
.mgf-mt-lg { margin-top: var(--mgf-space-6, 1.5rem); }
.mgf-pad-sm { padding: var(--mgf-space-2, 0.5rem); }
.mgf-pad-md { padding: var(--mgf-space-4, 1rem); }
.mgf-pad-lg { padding: var(--mgf-space-6, 1.5rem); }
.mgf-gap-sm { gap: var(--mgf-space-2, 0.5rem); }
.mgf-gap-md { gap: var(--mgf-space-4, 1rem); }
.mgf-gap-lg { gap: var(--mgf-space-6, 1.5rem); }
.mgf-flex { display: flex; }
.mgf-flex-col { display: flex; flex-direction: column; }
.mgf-flex-center { display: flex; align-items: center; justify-content: center; }
.mgf-flex-between { display: flex; align-items: center; justify-content: space-between; }
.mgf-flex-start  { display: flex; align-items: center; justify-content: flex-start; }
.mgf-flex-wrap   { flex-wrap: wrap; }

/* At narrow widths the 3-up / 4-up grids collapse gracefully to
   2-up; below 600px they fall back to single column. */
@media (max-width: 900px) {
  .mgf-stat-group { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mgf-comparison { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 600px) {
  .mgf-grid-3, .mgf-grid-4, .mgf-stat-group {
    grid-template-columns: minmax(0, 1fr);
  }
  .mgf-bento { grid-template-columns: minmax(0, 1fr); }
  .mgf-bento-item { grid-column: span 1; }
}

/* ── 19. RTL directional flips ───────────────────────────────────
   Modern CSS uses logical properties (margin-inline-start, padding-
   block, etc.) so most layouts mirror for free. The handful of
   rules below still use physical (left/right) properties and need
   explicit overrides under [dir="rtl"] so Arabic / Hebrew projects
   don't end up with bullets on the wrong side or clip-path arrows
   pointing the wrong way. Add new rules here whenever a project
   goes RTL and the visual layout breaks.
   ───────────────────────────────────────────────────────────────── */

[dir="rtl"] .mgf-list li {
  padding-left: 0;
  padding-right: var(--mgf-space-4, 1rem);
}
[dir="rtl"] .mgf-list li::before {
  left: auto;
  right: 0;
}
[dir="rtl"] .mgf-website-nav {
  flex-direction: row-reverse;
}
[dir="rtl"] .mgf-marquee-track {
  animation-direction: reverse;
}
[dir="rtl"] .mgf-marquee-track > * { direction: ltr; }
[dir="rtl"] .mgf-hbar {
  transform-origin: right;
}
`;