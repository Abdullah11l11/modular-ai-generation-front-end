import { useMemo } from 'react';
import type { Direction } from '@/types/api';

export type AssemblePreviewInput = {
  slideHtml: string;
  slideCss: string;
  layoutCss: string;
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

function replaceContentPlaceholders(html: string, contentJson: string | null): string {
  if (!contentJson) return html;
  try {
    const data = JSON.parse(contentJson);
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        return acc.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
      }
      return acc;
    }, html);
  } catch {
    return html;
  }
}

export function assemblePreviewHtml({
  slideHtml,
  slideCss,
  layoutCss,
  styleCss,
  contentJson,
  direction,
}: AssemblePreviewInput): string {
  const contentVars = injectContentVars(contentJson);
  const bodyHtml = replaceContentPlaceholders(slideHtml || '', contentJson);

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
    input.styleCss,
    input.contentJson,
    input.direction,
  ]);
}
