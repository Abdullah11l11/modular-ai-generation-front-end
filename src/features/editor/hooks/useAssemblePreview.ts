export function assemblePreviewHtml(
  slideHtml: string,
  perSlideCss: string,
  styleCss: string,
  layoutCss: string,
  direction: 'ltr' | 'rtl',
  contentVars?: Record<string, string>,
): string {
  let body = slideHtml;
  if (contentVars) {
    for (const [key, value] of Object.entries(contentVars)) {
      body = body.replaceAll(`{{${key}}}`, value);
    }
  }

  return `<!DOCTYPE html>
<html dir="${direction}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${layoutCss}</style>
  <style>${styleCss}</style>
  <style>${perSlideCss}</style>
</head>
<body>${body}</body>
</html>`;
}
