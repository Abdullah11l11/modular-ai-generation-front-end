import { useMemo } from 'react';
import type { Direction } from '@/types/api';
import { hasMathContent, MATH_HEAD_TAGS, MATH_RENDER_SCRIPT } from '@/features/editor/utils/mathRender';

export type AssemblePreviewInput = {
  slideHtml: string;
  slideCss: string;
  layoutCss: string;
  layoutHtml: string;
  styleCss: string;
  contentJson: string | null;
  direction: Direction;
};

function injectContentVars(contentJson: string | null): string {
  if (!contentJson) return '';
  try {
    const data = JSON.parse(contentJson);
    const vars = Object.entries(data)
      .filter(([_, v]) => typeof v === 'string' || typeof v === 'number')
      .map(([k, v]) => `  --content-${k.replace(/_/g, '-')}: ${v};`)
      .join('\n');
    return vars ? `:root {\n${vars}\n}\n` : '';
  } catch {
    return '';
  }
}

const CLICK_HANDLER = `
<script>
document.addEventListener('click',function(e){e.preventDefault();var el=e.target;var selector=el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(el.className?'.'+el.className.trim().split(/\\s+/).join('.'):'');window.parent.postMessage({type:'element-click',selector:selector},'*');});
<\/script>`;

/**
 * Editor-side base CSS. The project's own `style.css` may only define
 * `:root` tokens (`mgf-color-*`, `mgf-font-*`, `mgf-text-*`, etc.)
 * with no class rules. Inject a fallback layer that gives the standard
 * `mgf-*` classes visible styling using whatever variables are defined.
 * Variable lookups fall back to sane defaults if the project CSS
 * doesn't define them.
 *
 * `mgf-*` is the single class vocabulary — see
 * `src/lib/ai/prompts/standards/classes.md` for the full list.
 */
const BASE_CSS = `
:root { color-scheme: dark; }
html, body {
  margin: 0;
  padding: 0;
  background: var(--mgf-color-bg, #0b0f17);
  color: var(--mgf-color-text-primary, #f4f6fa);
  font-family: var(--mgf-font-body, system-ui, sans-serif);
  line-height: 1.5;
}
.mgf-deck {
  max-width: 960px;
  margin: 0 auto;
}
section.mgf-slide {
  padding: 2.5rem;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}
.mgf-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.7;
  margin: 0 0 0.5rem;
}
.mgf-accent-bar {
  width: 3rem;
  height: 0.25rem;
  background: var(--mgf-color-accent, #2f80ff);
  margin: 0.5rem 0 1rem;
}
.mgf-title {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
  line-height: 1.15;
}
.mgf-body {
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.85;
}
.mgf-slide-number {
  margin-top: auto;
  padding-top: 2rem;
  font-size: 0.875rem;
  opacity: 0.4;
  font-variant-numeric: tabular-nums;
}
/* Multi-column containers: any element ending in -cards, -grid, or
   -columns becomes a CSS grid. The user can target 2/3/4 columns by
   suffixing -cards-2, -cards-3, -cards-4. */
.mgf-cards, .mgf-grid, .mgf-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
.mgf-cards-2, .mgf-grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.mgf-cards-3, .mgf-grid-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.mgf-cards-4, .mgf-grid-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
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
.mgf-card-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.7;
  margin: 0;
}
.mgf-card-value {
  font-family: var(--mgf-font-display, system-ui, sans-serif);
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.1;
}

/* ── Website archetype (scrollable single-page sites) ───────────────
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

.mgf-cta-lg {
  padding: var(--mgf-space-4, 1rem) var(--mgf-space-8, 2rem);
  font-size: var(--mgf-text-base, 1rem);
}

/* Make sure the section-level stats/pricing grids sit nicely inside
   the wide 1200px section container. */
.mgf-website-section .mgf-stat-group { gap: var(--mgf-space-8, 2rem); }
.mgf-website-section .mgf-grid-4 { gap: var(--mgf-space-6, 1.5rem); }
.mgf-website-section .mgf-grid-3 { gap: var(--mgf-space-6, 1.5rem); }

/* Web archetype utility classes referenced from individual slide
   bodies (Features, Stats, Pricing, FAQ, CTA slides). The seeded
   slides use these tokens; without rules they fall back to plain
   block layout and the 3-up / 4-up grids collapse to single column.
   All values fall back to sane defaults if the project's style.css
   does not define the token. */

.mgf-eyebrow {
  font-size: var(--mgf-text-xs, 0.8125rem);
  text-transform: uppercase;
  letter-spacing: var(--mgf-tracking-wide, 0.08em);
  color: var(--mgf-color-accent, #22D3EE);
  font-weight: var(--mgf-weight-medium, 500);
  margin: 0 0 var(--mgf-space-2, 0.5rem);
}

.mgf-caption {
  font-size: var(--mgf-text-sm, 0.9375rem);
  color: var(--mgf-color-text-secondary, #94A3B8);
  margin: 0;
  line-height: var(--mgf-leading-normal, 1.5);
}

.mgf-text-center { text-align: center; }

.mgf-mt-sm { margin-top: var(--mgf-space-2, 0.5rem); }
.mgf-mt-md { margin-top: var(--mgf-space-4, 1rem); }
.mgf-mt-lg { margin-top: var(--mgf-space-6, 1.5rem); }

/* Background variants: a tinted band for hero / stats / CTA sections
   that should feel different from a plain dark section. */
.mgf-bg-accent-soft {
  background: var(--mgf-color-accent-soft, rgba(34, 211, 238, 0.08));
}

/* Callout surface used for wrapping a math block (or other
   standout element) on a slide. */
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

/* Card accent variant — same shape as .mgf-card but with an accent
   border + soft fill to draw the eye (used by featured pricing
   tier + the stats band). */
.mgf-card-accent {
  background: var(--mgf-color-surface-2, #1A2238);
  border: 1px solid var(--mgf-color-accent, #22D3EE);
  border-radius: var(--mgf-radius-lg, 18px);
  padding: var(--mgf-space-6, 1.5rem);
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-2, 0.5rem);
}

/* Features grid card anatomy — icon on top, title, description. */
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

/* Stats: 4-up horizontal grid where each stat is a centered
   .mgf-card-accent with a large value + small label. */
.mgf-stat-group {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--mgf-space-4, 1rem);
  text-align: center;
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
.mgf-stat-label {
  font-size: var(--mgf-text-sm, 0.9375rem);
  color: var(--mgf-color-text-secondary, #94A3B8);
  margin: 0;
}

/* Pricing slide: large price + tiny period suffix. */
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

.mgf-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--mgf-space-2, 0.5rem);
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

/* FAQ items: vertical stack of question + answer rows. The wide
   site layout already constrains the parent to 720px. */
.mgf-faq-item {
  padding: var(--mgf-space-4, 1rem) 0;
  border-bottom: 1px solid var(--mgf-color-border, #1F2940);
}
.mgf-faq-item:last-child {
  border-bottom: none;
}
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

/* CTA button — solid pill (no hover styles because the preview
   is non-interactive). Used in the website nav and at the end of
   pricing/CTA slides. */
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

/* At narrow widths the 3-up / 4-up grids collapse gracefully to
   2-up; below 600px they fall back to single column. */
@media (max-width: 900px) {
  .mgf-stat-group { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 600px) {
  .mgf-grid-3, .mgf-grid-4, .mgf-stat-group {
    grid-template-columns: minmax(0, 1fr);
  }
}`;

/**
 * Theme-aware overrides for KaTeX-rendered math. KaTeX's own CSS sets
 * hard-coded colors that won't track the project's tokens. These rules
 * (loaded alongside the project's `style.css`) recolor the math so it
 * picks up `--mgf-color-text-primary` / `--mgf-color-accent`.
 *
 * Wrapped under `body.mgf-math-enabled .mgf-math-root` so it only
 * takes effect on slides that opt into math. The render script adds
 * the `mgf-math-root` class via `<span class="math-inline">`'s parent
 * — we wrap them implicitly with `body.mgf-math-enabled`.
 */
const MATH_THEMED_CSS = `
body.mgf-math-enabled .mgf-math-root .katex,
body.mgf-math-enabled .mgf-math-root .katex .mord,
body.mgf-math-enabled .mgf-math-root .katex .mopen,
body.mgf-math-enabled .mgf-math-root .katex .mclose,
body.mgf-math-enabled .mgf-math-root .katex .mpunct,
body.mgf-math-enabled .mgf-math-root .katex .minner,
body.mgf-math-enabled .mgf-math-root .katex .mbin,
body.mgf-math-enabled .mgf-math-root .katex .mrel,
body.mgf-math-enabled .mgf-math-root .katex .mathnormal {
  color: var(--mgf-color-text-primary, inherit);
}
body.mgf-math-enabled .mgf-math-root .katex .accent,
body.mgf-math-enabled .mgf-math-root .katex .mathbf,
body.mgf-math-enabled .mgf-math-root .katex .mathit,
body.mgf-math-enabled .mgf-math-root .katex .mathrm {
  color: var(--mgf-color-text-primary, inherit);
}
body.mgf-math-enabled .mgf-math-root .katex .mathdefault,
body.mgf-math-enabled .mgf-math-root .katex .mathit {
  color: var(--mgf-color-text-primary, inherit);
}
body.mgf-math-enabled .mgf-math-root .katex .base,
body.mgf-math-enabled .mgf-math-root .katex .strut,
body.mgf-math-enabled .mgf-math-root .katex .mfrac .frac-line {
  color: var(--mgf-color-text-primary, inherit);
  border-color: var(--mgf-color-text-primary, inherit);
}
body.mgf-math-enabled .mgf-math-root .katex .mathnormal,
body.mgf-math-enabled .mgf-math-root .katex .mathit {
  color: var(--mgf-color-text-primary, inherit);
  font-style: italic;
}
body.mgf-math-enabled .mgf-math-root .katex .frac-line {
  border-bottom-color: var(--mgf-color-text-primary, inherit);
}
body.mgf-math-enabled .mgf-math-root .katex .overline,
body.mgf-math-enabled .mgf-math-root .katex .underline {
  border-color: var(--mgf-color-accent, currentColor);
}
body.mgf-math-enabled .mgf-math-root .katex .color,
body.mgf-math-enabled .mgf-math-root .katex .textcolor {
  color: var(--mgf-color-accent, currentColor);
}
body.mgf-math-enabled .mgf-math-root .math-block {
  margin: var(--mgf-space-4, 1rem) 0;
  text-align: center;
  display: block;
}
body.mgf-math-enabled .mgf-math-root .math-inline {
  display: inline-block;
}
`;

/**
 * Resolve a dotted path like `slides.0.data.title` against a parsed JSON
 * object. Returns the value as a string, or null if the path doesn't
 * resolve to a scalar.
 */
function resolvePath(data: unknown, path: string): string | null {
  const parts = path.split('.');
  let cursor: unknown = data;
  for (const part of parts) {
    if (cursor == null) return null;
    if (typeof cursor === 'object') {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }
  if (typeof cursor === 'string' || typeof cursor === 'number') {
    return String(cursor);
  }
  return null;
}

/**
 * Replace `{{key}}` and `{{a.b.c}}` placeholders in `html` with values
 * resolved from the parsed `contentJson`. Unresolved tokens are left in
 * place (never replaced with "undefined"). The special token `{{slides}}`
 * is replaced with the provided `slidesHtml`.
 */
function replaceContentPlaceholders(
  html: string,
  contentJson: string | null,
  slidesHtml: string,
): string {
  const SLIDES_TOKEN = '{{slides}}';
  const out = html.replaceAll(SLIDES_TOKEN, () => slidesHtml);

  if (!contentJson) return out;
  let data: unknown;
  try {
    data = JSON.parse(contentJson);
  } catch {
    return out;
  }

  return out.replace(/\{\{([\w.-]+)\}\}/g, (match, key: string) => {
    const resolved = resolvePath(data, key);
    return resolved ?? match;
  });
}

export function assemblePreviewHtml({
  slideHtml,
  slideCss,
  layoutCss,
  layoutHtml,
  styleCss,
  contentJson,
  direction,
}: AssemblePreviewInput): string {
  const contentVars = injectContentVars(contentJson);
  const slidesHtml = slideHtml || '';
  // Substitute `{{key}}` data placeholders inside slideHtml itself. The
  // `slidesHtml` argument is empty here because `{{slides}}` doesn't
  // appear inside an individual slide.
  const innerHtml = replaceContentPlaceholders(slidesHtml, contentJson, '');
  // Then substitute data placeholders + `{{slides}}` (with the resolved
  // slideHtml) inside the layout wrapper. If no layout is provided,
  // render the slide directly.
  const bodyHtml = layoutHtml
    ? replaceContentPlaceholders(layoutHtml, contentJson, innerHtml)
    : innerHtml;

  // Detect math content (`.math-inline` / `.math-block`) anywhere in
  // the rendered body. If present, inject KaTeX assets + render hook.
  // Otherwise skip the ~270KB CSS / 120KB JS load entirely.
  const hasMath = hasMathContent(bodyHtml);
  const mathHead = hasMath ? MATH_HEAD_TAGS : '';

  // The body gets two cooperating classes when math is on the page:
  //
  //   `mgf-math-enabled` — used by `MATH_THEMED_CSS` to scope the
  //   theme-aware `.katex` recolor rules. Adding this also forces a
  //   paint so the rules don't bleed into math-free pages.
  //
  //   `mgf-math-root` — the scope wrapper the KaTeX render script
  //   queries against (`.mgf-math-root .math-inline` / `.math-block`).
  //   Both classes on the same body element beat having to either
  //   rewrite the renderer or wrap every math element in an extra
  //   `<div>` — the body's outer element already satisfies the
  //   "inside it" condition from `mathRender.ts`'s docstring.
  const bodyClass = hasMath ? 'mgf-math-enabled mgf-math-root' : '';
  return `<!DOCTYPE html>
<html dir="${direction}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
${BASE_CSS}
${contentVars}
${layoutCss}
${styleCss}
${slideCss}
${MATH_THEMED_CSS}
</style>
${CLICK_HANDLER}
${mathHead}
</head>
<body class="${bodyClass}">${bodyHtml}${hasMath ? MATH_RENDER_SCRIPT : ''}</body>
</html>`;
}

export function useAssemblePreview(input: AssemblePreviewInput): string {
  return useMemo(
    () => assemblePreviewHtml(input),
    [
      input.slideHtml,
      input.slideCss,
      input.layoutCss,
      input.layoutHtml,
      input.styleCss,
      input.contentJson,
      input.direction,
    ],
  );
}
