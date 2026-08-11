import { useMemo } from 'react';
import type { Direction } from '@/types/api';

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
 * `:root` variables (UVCP convention), with no class rules. Inject a
 * fallback layer that gives standard UVCP/MGF slide classes visible
 * styling using whatever variables are defined. Variable lookups fall
 * back to sane defaults if the project CSS doesn't define them.
 *
 * `section[class*="-slide"]` and friends match any `-slide` suffix
 * (uvcp-slide, mgf-slide, etc.) so this works across naming conventions.
 */
const BASE_CSS = `
:root { color-scheme: dark; }
html, body {
  margin: 0;
  padding: 0;
  background: var(--uvcp-color-bg, var(--mgf-bg, #0b0f17));
  color: var(--uvcp-color-text-primary, var(--mgf-fg, #f4f6fa));
  font-family: var(--uvcp-font-body, var(--mgf-font, system-ui, sans-serif));
  line-height: 1.5;
}
[class*="-deck"], .uvcp-deck, .mgf-deck {
  max-width: 960px;
  margin: 0 auto;
}
section[class*="-slide"], section.uvcp-slide, section.mgf-slide {
  padding: 2.5rem;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
[class*="-label"], .uvcp-label, .mgf-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.7;
  margin: 0 0 0.5rem;
}
[class*="-accent-bar"], .uvcp-accent-bar, .mgf-accent-bar {
  width: 3rem;
  height: 0.25rem;
  background: var(--uvcp-color-accent, var(--mgf-accent, #2f80ff));
  margin: 0.5rem 0 1rem;
}
[class*="-title"], h2.uvcp-title, h2.mgf-title {
  font-family: var(--uvcp-font-display, var(--mgf-font, system-ui, sans-serif));
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
  line-height: 1.15;
}
[class*="-body"], .uvcp-body, .mgf-body {
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.85;
}
[class*="-slide-number"], .uvcp-slide-number, .mgf-slide-number {
  margin-top: auto;
  padding-top: 2rem;
  font-size: 0.875rem;
  opacity: 0.4;
  font-variant-numeric: tabular-nums;
}
/* Multi-column containers: any element that ends in "-cards",
   "-grid", or "-columns" becomes a CSS grid. The user can target
   2/3/4 columns by suffixing -cards-2, -cards-3, -cards-4, etc. */
[class*="-cards"], [class*="-grid"], [class*="-columns"],
.uvcp-cards, .uvcp-grid, .uvcp-columns,
.mgf-cards, .mgf-grid, .mgf-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
[class*="-cards-2"], .uvcp-cards-2, .mgf-cards-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
[class*="-cards-3"], .uvcp-cards-3, .mgf-cards-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
[class*="-cards-4"], .uvcp-cards-4, .mgf-cards-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
/* Card surface — every element ending in "-card" (uvcp-card, mgf-card,
   etc.) gets a default bordered surface if the project doesn't bring
   its own rules. Variable lookups fall back to the same defaults as
   the rest of the base CSS. */
[class*="-card"], .uvcp-card, .mgf-card {
  background: var(--uvcp-color-surface, var(--mgf-surface, #0f1218));
  border: 1px solid var(--uvcp-color-border, var(--mgf-border, rgba(255,255,255,0.08)));
  border-radius: var(--uvcp-radius-lg, var(--mgf-radius, 12px));
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
[class*="-card-label"], .uvcp-card-label, .mgf-card-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.7;
  margin: 0;
}
[class*="-card-value"], .uvcp-card-value, .mgf-card-value {
  font-family: var(--uvcp-font-display, var(--mgf-font, system-ui, sans-serif));
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.1;
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
</style>
${CLICK_HANDLER}
</head>
<body>${bodyHtml}</body>
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
