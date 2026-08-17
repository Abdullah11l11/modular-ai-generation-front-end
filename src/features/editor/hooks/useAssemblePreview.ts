import { useMemo } from 'react';
import type { Direction } from '@/types/api';
import { hasMathContent, MATH_HEAD_TAGS, MATH_RENDER_SCRIPT } from '@/features/editor/utils/mathRender';
import { ARABIC_FONT_LINKS, ARABIC_FONT_STACK } from '@/features/editor/utils/arabicFont';
import { BASE_CSS } from '@/features/editor/lib/baseCss';

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
  // `lang` mirrors the project's `direction` so the browser picks
  // the right hyphenation, font-fallback, and spell-check rules per
  // paragraph. RTL → `ar` is the only seeded case today; if the
  // project metadata ever grows a `language` field, prefer that.
  const lang = direction === 'rtl' ? 'ar' : 'en';
  // For RTL projects, drop in the Google Fonts pair + a `:root `-scoped
  // font-family override. The override only takes effect if the project
  // CSS doesn't define `--mgf-font-body` / `--mgf-font-display` itself
  // (which is the common case for seeded Arabic projects). Defining the
  // fonts at `:root` rather than on `body` lets `inherit`-using
  // descendants still pick them up.
  const rtlFonts = direction === 'rtl'
    ? `${ARABIC_FONT_LINKS}<style>:root { --mgf-font-body: ${ARABIC_FONT_STACK}; --mgf-font-display: ${ARABIC_FONT_STACK}; }</style>`
    : '';
  return `<!DOCTYPE html>
<html dir="${direction}" lang="${lang}">
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
${rtlFonts}
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
