/** Generate a new layout layer for a specific output format. */
export const TASK_GENERATE_LAYOUT_PROMPT = `Generate the layout layer for an MGF project. This file defines how \`mgf-*\` classes behave for a specific output format. Keep all class names identical — only change the layout rules (dimensions, padding, font scaling, grid behavior).

## Input

Read the project's \`context\` first for output target and format.
Read the reference layout for the full class set.

## Output Format

Output a complete layout CSS file with the same class names as the reference, adjusted for the target format.

## Common Format Specifications

### 16:9 (1280×720px) — Presentation
\`\`\`
--mgf-slide-w: 1280px
--mgf-slide-h: 720px
--mgf-slide-pad-x: 80px
--mgf-slide-pad-y: 60px
\`\`\`

### 1:1 (1080×1080px) — Social Carousel
\`\`\`
--mgf-slide-w: 1080px
--mgf-slide-h: 1080px
--mgf-slide-pad-x: 64px
--mgf-slide-pad-y: 64px
\`\`\`

### 9:16 (1080×1920px) — Story / Reel
\`\`\`
--mgf-slide-w: 1080px
--mgf-slide-h: 1920px
--mgf-slide-pad-x: 48px
--mgf-slide-pad-y: 80px
\`\`\`

### 4:3 (1440×1080px) — Traditional Slide
\`\`\`
--mgf-slide-w: 1440px
--mgf-slide-h: 1080px
--mgf-slide-pad-x: 80px
--mgf-slide-pad-y: 60px
\`\`\`

## Rules

- All \`.mgf-*\` class names must remain identical to the reference
- Only change: dimensions, padding, font sizes, grid columns, flex behavior
- Font sizes in narrow formats (9:16) should be proportionally larger for readability
- Grid layouts should collapse gracefully for narrow formats
- The \`mgf-slide\` dimensions and padding are the primary changes per format
- Output ONLY the layout layer CSS. No markdown code fences. No preamble.`;
