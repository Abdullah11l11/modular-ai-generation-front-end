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
  return useMemo(() => assemblePreviewHtml(input), [
    input.slideHtml,
    input.slideCss,
    input.layoutCss,
    input.layoutHtml,
    input.styleCss,
    input.contentJson,
    input.direction,
  ]);
}
