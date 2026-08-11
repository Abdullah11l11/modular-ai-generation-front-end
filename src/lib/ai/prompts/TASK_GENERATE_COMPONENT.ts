/** Generate a new component (one slide type) using mgf-* classes only. */
export const TASK_GENERATE_COMPONENT_PROMPT = `Generate a new component HTML file for an MGF project. This file defines the structure of one slide type. Use only \`mgf-*\` classes. No inline styles. No hardcoded colors.

## Input

Read the project's \`style\` and \`layout\` layers to understand the tokens and class behaviors.

## Component Rules

1. **One component = one slide type.** If you need a variant, create a new file.
2. **Use only mgf-* classes.** No inline styles, no hardcoded colors.
3. **Declare data fields with \`data-field\` attributes.** This is how the renderer injects content.
4. **Provide fallback content** inside each \`data-field\` element so the component is readable without data.
5. **The root element must be \`<section class="mgf-slide">\`.**
6. **Include a \`mgf-slide-number\` element** with \`data-field="id"\` for the slide counter.
7. **All images use \`data-field\` attributes** — use descriptive field names like \`image_placeholder\`, \`avatar\`, \`thumbnail\`.

## Common Data-Field Patterns

### Simple text
\`\`\`html
<h2 class="mgf-title" data-field="title">Fallback Title</h2>
\`\`\`

### Rich text / body
\`\`\`html
<p class="mgf-body" data-field="body">Fallback body text.</p>
\`\`\`

### Array (renderer creates li elements)
\`\`\`html
<ul class="mgf-list" data-field="points">
  <li>Point one</li>
  <li>Point two</li>
</ul>
\`\`\`

### Stats grid (renderer populates each .mgf-card)
\`\`\`html
<div class="mgf-stat-group" data-field="stats">
  <div class="mgf-card">
    <p class="mgf-stat-value" data-field="value">42</p>
    <p class="mgf-stat-label" data-field="label">Answer</p>
  </div>
</div>
\`\`\`

### Image with fallback
\`\`\`html
<div data-field="image_placeholder">
  <!-- Fallback: renderer replaces this div with <img> if image_placeholder is set -->
  <div class="mgf-media-placeholder">📷</div>
</div>
\`\`\`

### Avatar
\`\`\`html
<div class="mgf-avatar-lg">
  <img data-field="avatar" src="" alt="Author photo" />
</div>
\`\`\`

### CTA link
\`\`\`html
<a class="mgf-cta" href="#" data-field="cta_url" data-label-field="cta">Learn More →</a>
\`\`\`

## Rules

- The component filename should match the component name: \`quote.html\`, \`features.html\`, etc.
- Component file lives in the shared components directory (framework) or a project-specific components directory.
- SVG icons are allowed but must not have inline color attributes — use currentColor
- Output ONLY the component HTML content. No markdown code fences. No preamble.`;
