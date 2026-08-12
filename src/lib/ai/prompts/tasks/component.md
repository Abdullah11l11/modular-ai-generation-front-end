# Task: Generate a Single Component

Generate one component HTML file for an MGF project. The component
defines the structure of one slide type. Use only `mgf-*` classes
from the standard vocabulary. No inline styles. No hardcoded colors.

## Input

Read the project's `style` and `layout` layers to understand the
tokens and class behaviors. Read `standards/classes.md` for the
class list and `standards/tokens.md` for the variables.

## Output

A JSON object whose only top-level key is `<component-name>.html`. The
value is the full HTML file contents (no markdown fences, no
preamble). The component name is the basename without extension
(e.g. `quote.html` for the `quote` component).

## Component rules

1. **One component = one slide type.** If you need a variant, create a new file.
2. **Use only `mgf-*` classes.** No inline styles, no hardcoded colors.
3. **Declare data fields with `data-field` attributes.** This is how the renderer injects content.
4. **Provide fallback content** inside each `data-field` element so the component is readable without data.
5. **The root element must be `<section class="mgf-slide">`.**
6. **Include a `mgf-slide-number` element** with `data-field="id"` for the slide counter. It must be the **last** child of `mgf-slide` so flexbox `margin-top: auto` pushes it to the bottom.
7. **All images use `data-field` attributes** — use descriptive field names like `image_placeholder`, `avatar`, `thumbnail`.

## Common data-field patterns

### Simple text

```html
<h2 class="mgf-title" data-field="title">Fallback Title</h2>
```

### Rich text / body

```html
<p class="mgf-body" data-field="body">Fallback body text.</p>
```

### Array (renderer creates `<li>` elements)

```html
<ul class="mgf-list" data-field="points">
  <li>Point one</li>
  <li>Point two</li>
</ul>
```

### Stats grid (renderer populates each `mgf-card`)

```html
<div class="mgf-stat-group" data-field="stats">
  <div class="mgf-card">
    <p class="mgf-stat-value" data-field="value">42</p>
    <p class="mgf-stat-label" data-field="label">Answer</p>
  </div>
</div>
```

### Image with fallback

```html
<div data-field="image_placeholder">
  <div class="mgf-media-placeholder">📷</div>
</div>
```

### Avatar

```html
<div class="mgf-avatar-lg">
  <img data-field="avatar" src="" alt="Author photo" />
</div>
```

### CTA link

```html
<a class="mgf-cta" href="#" data-field="cta_url" data-label-field="cta">Learn More →</a>
```

## Layout rules

See `standards/layout-rules.md` for the anti-patterns. In summary:
keep titles under 8 words, body under 40 words, use `mgf-grid-*` for
multi-element layouts, never nest a card inside a card, never use
inline styles or hardcoded hex.

## Math (KaTeX)

Components may contain scientific formulas using KaTeX. See
`standards/math.md` for the full contract. In summary:

- Inline: `<span class="math-inline" data-tex="E=mc^2"></span>`
- Block: `<div class="math-block" data-tex="\\frac{a}{b}"></div>`
- Always double-escape backslashes inside `data-tex`.
- `data-tex` is an HTML attribute — no `"`, `<`, `>`, or unescaped `&`.

```html
<p class="mgf-body">
  The Pythagorean identity:
  <span class="math-inline" data-tex="a^2 + b^2 = c^2"></span>
</p>
<div class="math-block" data-tex="\\int_a^b f(x)\\,dx = F(b) - F(a)"></div>
```

If a slide has no math, emit no tags — the assembler skips KaTeX
loading entirely, keeping slides lean.

## Rules

- The component filename must match the component name (e.g. `quote.html`).
- SVG icons are allowed but must not have inline color attributes — use `currentColor`.
- Output ONLY the component HTML content. No markdown fences. No preamble.
