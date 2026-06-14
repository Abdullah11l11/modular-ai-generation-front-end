type AssemblePreviewParams = {
  slideHtml: string;
  styleCss: string;
  layoutCss: string;
  direction: 'ltr' | 'rtl';
};

export function assemblePreview({ slideHtml, styleCss, layoutCss, direction }: AssemblePreviewParams): string {
  return `<!DOCTYPE html>
<html dir="${direction}" lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; font-family: system-ui, -apple-system, sans-serif; }
    ${styleCss}
    ${layoutCss}
  </style>
</head>
<body>
  ${slideHtml}
</body>
</html>`;
}
