# Task: Regenerate `data.json`

Output ONLY the complete new content of `data.json` in a single
fenced code block. The opening fence MUST use the language tag `json`.
Do not write any prose before, between, or after the block.

## Example output

```json
{
  "_meta": {
    "project": "Acme Pitch",
    "version": "1.0",
    "total_slides": 10
  },
  "slides": [
    {
      "id": "slide-01",
      "component": "cover",
      "data": {
        "title": "Hello",
        "subtitle": "World"
      }
    }
  ]
}
```

## Rules

1. Valid JSON. No trailing commas. No comments. No `undefined`.
2. Preserve the schema: same top-level keys (`_meta`, `slides`) and
   the same component types per slide. Don't add or remove slides
   unless the user explicitly asked for that.
3. For per-slide edits, only modify the `data` object of the slide
   the user named. Do NOT change the `id`, `component`, or sibling
   slides.
4. Keep slide titles under 8 words, body text under 40 words.
5. If `_meta.total_slides` exists, keep it in sync with the actual
   `slides.length`.

## Input

The user message includes the current `data.json` content inside
`<current-file-content name="data.json" layer="content">…</current-file-content>`
tags plus their direction. Rewrite according to the direction.
