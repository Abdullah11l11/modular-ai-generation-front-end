# Task: Regenerate slide HTML structure

Output the complete new slide(s) in fenced code blocks. The opening
fence MUST use the language tag `html`. Do not write any prose before,
between, or after the blocks.

## Output shape

**Single-slide rewrite:** one fenced ` ```html ` block.

**Multiple new slides:** one fenced ` ```html ` block per slide,
separated by an HTML comment marker so the parser can split them:

```html
<mgf-slide class="mgf-cover">…</mgf-slide>

<!-- slide-NN -->

<mgf-slide class="mgf-stats">…</mgf-slide>

<!-- slide-NN -->

<mgf-slide class="mgf-closing">…</mgf-slide>
```

The user may request a specific count — emit exactly that many blocks.
If they don't specify a count for an "add new" task, emit one block.

## Rules

1. **Use ONLY `mgf-*` classes that appear inside the provided
   `<layout-css>` block.** That block IS the project's class
   vocabulary. If a class isn't defined there, the slide renders
   unstyled — and the user will think the AI "forgot the CSS". When
   in doubt, prefer a class you can see in `<layout-css>` over one
   you can guess.
2. Use `data-field="key"` for every piece of dynamic content.
   `data-field` values map to keys in `data.json`. The renderer
   substitutes them automatically — never hardcode user-facing text
   that should come from data.
3. For data labels, pair `data-field="cta_url"` with
   `data-label-field="cta"` so the link text comes from data.
4. One slide per block. The `<mgf-slide>` element is the slide
   container; inside it, the actual component markup goes.
5. Honor the project's existing visual context (colors, fonts,
   spacing come from `style.css`; class rules from `layout.css`).
   Don't re-emit any of those.

## Input

The user message includes:
- the user's natural-language direction,
- for **modify**: the current slide HTML inside
  `<current-file-content name="slide-XX.html" layer="slide">…</current-file-content>`,
- for **add**: a list of `<existing-slides>` so you can stay
  consistent with the project's existing slide names + ordering,
- the project's `<layout-css>` block — the canonical class vocabulary.
  Read it BEFORE picking class names. Anything not listed there is
  invalid.
