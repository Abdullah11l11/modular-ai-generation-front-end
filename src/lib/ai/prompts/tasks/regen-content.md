# Task: Regenerate slide content

Output a single fenced ` ```json ` block containing a **flat map of
`data-field` keys to their new values**. Do not write any prose
before, between, or after the block.

## Output shape

```json
{
  "eyebrow": "New eyebrow text",
  "title": "New title",
  "body": "New body paragraph",
  "point_0": "First bullet",
  "point_1": "Second bullet"
}
```

## Rules

1. **Emit ONLY keys the user asked you to change.** If the user said
   "rewrite the title", your JSON should contain only `title`. Other
   keys stay untouched in the file.
2. **Match the key names exactly.** Keys are `data-field` attribute
   values inside the slide HTML (`<h2 data-field="title">…</h2>`).
   Spelling / casing matters — `Title` won't update `title`.
3. **Respect scope.** When `<scope>current</scope>` is set, only emit
   keys that belong to the slide listed in `<target-slide>`. Sibling
   slide keys must not appear.
4. Keep slide titles under 8 words, body text under 40 words.
5. Don't add new keys the slide HTML doesn't already have — there is
   no UI surface to enter them.

## Input

The user message includes:
- the user's natural-language direction,
- a `<scope>` tag: `whole` (every slide) or `current` (only the
  selected slide),
- when `<scope>current</scope>`: a `<target-slide>` block listing the
  slide filename and its current `data-field` keys,
- a `<required-data-keys>` list — every `data-field` key that exists
  in scope, so you don't accidentally rename them,
- the current `data.json` content inside
  `<current-file-content name="data.json" layer="content">…</current-file-content>`,
- the slide HTML files inside `<slide-html-context>` so you can see
  exactly which keys each slide has.

Rewrite according to the direction. Emit only the keys you actually
want to change.