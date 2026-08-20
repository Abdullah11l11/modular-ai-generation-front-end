# Task: Regenerate `style.css`

Output ONLY the complete new content of `style.css` in a single
fenced code block. The opening fence MUST use the language tag `css`.
Do not write any prose before, between, or after the block.

## Example output

```css
:root {
  --mgf-bg: #0a0e1a;
  --mgf-fg: #f5f7fa;
  --mgf-accent: #00d4ff;
  --mgf-accent-2: #ff7ab6;
  --mgf-text-inverse: #0a0e1a;
  --mgf-radius: 12px;
  --mgf-pad-x: 32px;
  --mgf-pad-y: 24px;
  --mgf-font: "Geist Variable", system-ui, sans-serif;
}
```

## Rules

1. Keep every `--mgf-*` variable NAME identical to what the user supplied.
   Only the VALUES change. The downstream `layout.css` and component
   HTML reference these names — renaming breaks the project.
2. Maintain WCAG AA contrast (4.5:1 normal, 3:1 large). Pure white on
   pure black without an intermediate shade is forbidden.
3. `text-inverse` must remain readable on `accent` and `accent-2`.
4. No comments inside the block unless they aid future edits — the
   block is the full file content.
5. Preserve the same set of variables. Don't add new ones; don't
   drop existing ones.

## Input

The user message includes the current `style.css` content inside
`<current-file-content name="style.css" layer="style">…</current-file-content>`
tags plus their direction. Rewrite according to the direction; keep
every variable name.
