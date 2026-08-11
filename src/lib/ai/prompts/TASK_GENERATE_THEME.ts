/** Generate or regenerate the style layer (theme tokens) for an MGF project. */
export const TASK_GENERATE_THEME_PROMPT = `Generate the style layer for an MGF project. This file defines ALL brand tokens as CSS custom properties. Keep all \`--mgf-*\` variable names identical — only change the values.

## Input

Read the project's \`context\` first. It contains the brand voice, visual constraints, and palette direction.

Also read the reference theme to understand the full variable set.

## Required Variable Names (DO NOT CHANGE)

All these names must appear in your output exactly as shown. Only their values should change.

### Colors
\`\`\`css
--mgf-color-bg
--mgf-color-surface
--mgf-color-surface-2
--mgf-color-border
--mgf-color-border-strong
--mgf-color-text-primary
--mgf-color-text-secondary
--mgf-color-text-inverse
--mgf-color-accent
--mgf-color-accent-soft
--mgf-color-accent-2
\`\`\`

### Typography
\`\`\`css
--mgf-font-display
--mgf-font-body
--mgf-font-mono
--mgf-text-xs
--mgf-text-sm
--mgf-text-base
--mgf-text-lg
--mgf-text-xl
--mgf-text-2xl
--mgf-text-3xl
--mgf-text-4xl
--mgf-weight-normal
--mgf-weight-medium
--mgf-weight-bold
--mgf-leading-tight
--mgf-leading-normal
--mgf-leading-loose
--mgf-tracking-tight
--mgf-tracking-normal
--mgf-tracking-wide
\`\`\`

### Spacing
\`\`\`css
--mgf-space-1
--mgf-space-2
--mgf-space-3
--mgf-space-4
--mgf-space-6
--mgf-space-8
--mgf-space-12
--mgf-space-16
--mgf-space-24
\`\`\`

### Shape
\`\`\`css
--mgf-radius-sm
--mgf-radius-md
--mgf-radius-lg
--mgf-radius-xl
\`\`\`

### Slide Canvas
\`\`\`css
--mgf-slide-w
--mgf-slide-h
--mgf-slide-pad-x
--mgf-slide-pad-y
\`\`\`

### Decorative
\`\`\`css
--mgf-accent-line
--mgf-divider
\`\`\`

## Rules

- Every variable MUST have a value — do not leave any undefined
- Colors must pass WCAG AA contrast (4.5:1 for normal text, 3:1 for large text)
- font-display and font-body can be the same or different
- slide dimensions should match the target format (1280×720 for 16:9, 1080×1080 for 1:1, etc.)
- accent-2 should be a secondary accent color (success green, warning yellow, etc.)
- text-inverse should be a color that works as text on accent backgrounds
- Output ONLY the style layer CSS. No markdown code fences. No preamble.`;
