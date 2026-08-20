# Roundtrip Validation Contract

This document is the contract every MGF-compatible output must satisfy
to be accepted on re-upload via `/projects/new/ai` or `/templates/new`
on the MGF site. Read it before you generate anything.

## 1. Output format

Every response must be **a single JSON object** mapping filename to
file content. No markdown fences, no code-block wrapping, no
preamble, no postamble, no commentary.

```json
{
  "style.css": "/* full CSS */",
  "layout.css": "/* full CSS */",
  "data.json": "/* full JSON content */",
  "slide-01.html": "<!-- full HTML -->",
  "slide-02.html": "<!-- full HTML -->",
  "_meta": { /* metadata */ }
}
```

The first character of the response must be `{`. The last must be `}`.

## 2. Required top-level keys

| Key            | Required | Description                                     |
| -------------- | -------- | ----------------------------------------------- |
| `style.css`    | yes      | Full `:root` token block.                       |
| `layout.css`   | yes      | Full rule set for every `mgf-*` class used.     |
| `data.json`    | yes      | Content schema — drives `slide-NN.html`.        |
| `slide-NN.html`| yes × N  | One per slide. `NN` is zero-padded to 2 digits. |
| `_meta`        | yes      | Project metadata (see § 4).                     |

Every value is a **string** of the full file content. Never elide with
`...`, `<!-- TODO -->`, or anything else.

## 3. Filename rules

- Extensions are lowercase, no spaces, no uppercase.
- Slide numbers start at `01` (not `0`, not `1`).
- Numbers are sequential with no gaps.
- The total number of `slide-NN.html` keys must equal `_meta.total_slides`.

## 4. `_meta` invariants

```json
{
  "_meta": {
    "project": "string",
    "version": "1.0",
    "output_target": "presentation | dashboard | website | infographic",
    "format": "16:9 | 4:3 | 1:1 | A4 | letter",
    "total_slides": 4,
    "components_used": ["cover", "stats", "feature", "closing"]
  }
}
```

- `total_slides` MUST equal the number of `slide-NN.html` keys.
- `components_used` MUST list every `data-field` value used in the slide HTML files. Mismatches are rejected.
- `version` is currently always `"1.0"`.
- `format` defaults to `"16:9"` for `presentation`.

## 5. Token contract (`style.css`)

`style.css` MUST define every variable listed in
`prompts/standards/tokens.md`, with at least the documented fallback
values. Renaming a variable is not allowed — the consumer reads tokens
by name.

Required top-level variables (with fallback values):

```css
:root {
  /* Theme variables — every project gets a fresh set generated/edited by AI or user */
  --mgf-bg: #ffffff;
  --mgf-surface: #f8fafc;
  --mgf-fg: #0f172a;
  --mgf-muted: #64748b;
  --mgf-accent: #2563eb;
  --mgf-accent-fg: #ffffff;
  --mgf-border: #e2e8f0;
  --mgf-radius: 12px;
  --mgf-pad: 24px;
  --mgf-font-body: ui-sans-serif, system-ui, sans-serif;
  --mgf-font-display: ui-sans-serif, system-ui, sans-serif;
}
```

**Accent pairings must pass WCAG AA contrast.** If `--mgf-accent-fg`
on `--mgf-accent` does not achieve 4.5:1, swap or darken one of them.

## 6. Class contract (`layout.css` + slide HTML)

- Only `mgf-*` classes from `prompts/standards/classes.md`. No
  arbitrary class names, no Tailwind utility classes, no inline styles.
- No hardcoded colors — every color reads through `var(--mgf-*)`.
- No `!important`, no `position: absolute` outside of `.mgf-full`
  and `.mgf-marquee`.
- Every class rule that uses a token must do so through `var(...)`,
  not a fallback to a literal.

Slide HTML structure (one slide as an example):

```html
<section class="mgf-slide mgf-split-left">
  <div class="mgf-stack">
    <span class="mgf-eyebrow" data-field="eyebrow">Series A · Q3 2026</span>
    <h1 class="mgf-title" data-field="title">Lumen AI</h1>
    <p class="mgf-lede" data-field="lede">Tagline goes here.</p>
  </div>
  <div class="mgf-stat-group">
    <div class="mgf-stat">
      <span class="mgf-stat-value" data-field="stat-1-value">142%</span>
      <span class="mgf-stat-label" data-field="stat-1-label">MoM growth</span>
    </div>
  </div>
  <span class="mgf-slide-number" data-field="id">01</span>
</section>
```

Every slide MUST include `mgf-slide-number` with `data-field="id"`.

## 7. Content rules

- Slide titles under 8 words.
- Body text under 40 words per slide.
- List items under 12 words each.
- Slide IDs sequential starting at `01`.
- One narrative arc: Cover → Problem → Solution → Proof → Closing
  (deviate only when the brief makes a different arc more compelling).

## 8. Layout invariants

See `prompts/standards/layout-rules.md`. Highlights:

- No content overflows the slide canvas.
- No content underflows to less than 50% of the canvas.
- Font sizes stay within `clamp()` ranges from `tokens.md`.
- Spacing uses `--mgf-pad` and `--mgf-space-*`, not raw rem values.

## 9. Re-upload path

When the JSON object above is pasted into `/projects/new/ai` on the
MGF site:

1. The frontend parses the JSON.
2. Each top-level key is written to a project file under its name.
3. `_meta` is parsed and stored as the project's metadata.
4. The first preview is rendered live so you can confirm it worked.

If a rule in this document is violated, the site will surface an
error at parse time (bad JSON) or render time (missing class,
missing token, layout overflow). Fix the offending file and re-upload.

## 10. Common failure modes

| Symptom                                  | Likely cause                                |
| ---------------------------------------- | ------------------------------------------- |
| JSON parse error                         | Markdown fences around the JSON, or trailing prose |
| Slide missing in preview                 | `slide-NN.html` not present, or number gap   |
| Slide renders blank                      | Missing class or wrong `data-field` value   |
| Colors hardcoded / wrong                 | Inline styles instead of `var(--mgf-*)`     |
| Layout overflow                          | Pixel values instead of `clamp()`           |
| `_meta.total_slides` mismatch            | Added or removed a slide without updating `_meta` |
| `_meta.components_used` mismatch         | Used a component not listed in `data.json`  |