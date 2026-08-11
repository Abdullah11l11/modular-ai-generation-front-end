# Output Schema

The MGF (Modular Generation Framework) defines a single output contract:
**a JSON object that maps filename to file content.** Every generation task
(full project, layout, content, theme, single component, layer regen)
emits JSON in exactly this shape. The frontend parses it with
`JSON.parse`; the backend seeders can `json_decode` and write each key
to disk.

```json
{
  "style.css": "/* full CSS file contents */",
  "layout.css": "/* full CSS file contents */",
  "data.json": "/* full JSON file contents */",
  "slide-01.html": "<!-- full HTML file contents -->",
  "slide-02.html": "<!-- full HTML file contents -->",
  "_meta": {
    "project": "string",
    "version": "1.0",
    "output_target": "presentation",
    "format": "16:9",
    "total_slides": 2,
    "components_used": ["cover", "stats"]
  }
}
```

## Top-level keys

| Key            | Type     | Required | Notes                                                     |
| -------------- | -------- | -------- | --------------------------------------------------------- |
| `style.css`    | string   | yes      | Full `:root` token block. See `tokens.md`.               |
| `layout.css`   | string   | yes      | Full rule set for every `mgf-*` class. See `classes.md`.  |
| `data.json`    | string   | yes      | Full JSON content schema. See `tasks/content.md`.         |
| `slide-NN.html`| string   | yes      | One per slide. NN is `01`, `02`, … zero-padded.           |
| `_meta`        | object   | yes      | Project metadata; mirrors the `meta` layer.               |

## Rules

1. **Every file is complete.** Never emit elided content (`...`, `<!-- TODO -->`, etc.).
2. **Filenames are exact.** Trailing extensions, lowercase, no spaces. Slide numbers are zero-padded to two digits.
3. **No markdown fences around the JSON.** The output is the JSON itself, not a markdown code block containing JSON.
4. **No preamble, no postamble.** The response is the JSON object and nothing else.
5. **One object per response.** If the task is layer regeneration, emit only the changed files; preserve the rest of the project by leaving prior keys untouched.
6. **`_meta.total_slides`** must match the number of `slide-NN.html` keys.
7. **`_meta.components_used`** must list the `data-field` component names the slide HTML files actually use.
