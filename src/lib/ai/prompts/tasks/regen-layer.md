# Task: Regenerate One Layer

Regenerate one specific layer of an existing MGF project. The user
supplies the current state of the project and the new direction. The
job is to replace ONLY the target layer — every other layer must stay
byte-identical to what the user supplied.

## Input

The user provides:

- The current project state (the relevant layers as JSON keys mirroring `standards/output-schema.md`).
- The target layer to regenerate (one of: `slide`, `style`, `layout`, `content`, `context`, `rules`, `meta`, `asset`).
- The new direction (what should change and why).

## Output

A JSON object whose top-level keys match the full project schema. The
value of the target layer holds the regenerated content; the other
keys hold the user's original content, unchanged. The `_meta` key
gets refreshed (new `generated_at`, version bump appropriate to scope).

### When the target layer is anything other than `asset`

Emit every layer key from the user's input. The block whose key
matches the target layer holds the regenerated content; the others
hold the user's original content verbatim.

### When the target layer is `asset`

Emit a single `asset` key whose value is the asset descriptor (or
list of descriptors) to add, remove, or replace.

## Per-layer rules

### Regenerate `content` (most common — single slide or full layer)

- If regenerating a single slide: only modify that slide's `data` object.
- Do NOT change the `id`, `component` type, or any other slides.
- Preserve the exact schema for the component type (see `tasks/content.md`).
- Keep slide title under 8 words.
- Keep body text under 40 words.
- List items under 12 words each.
- Update `_meta.total_slides` only if the slide count actually changes.

### Regenerate `style`

- Keep ALL `--mgf-*` variable names identical to `standards/tokens.md`.
- Only change the values.
- Maintain WCAG AA contrast.
- `accent-2` is a secondary accent color.
- `text-inverse` must work on accent backgrounds.

### Regenerate `layout`

- All `mgf-*` class names must remain identical to `standards/classes.md`.
- Only change: dimensions, padding, font sizes, grid columns, flex behavior.
- Adjust `--mgf-slide-w`, `--mgf-slide-h`, `--mgf-slide-pad-x`, `--mgf-slide-pad-y` for the target format.

### Regenerate `slide` (the HTML component wrapper)

- Keep class names from the layout layer.
- Keep the `data-field` contract with the content layer.
- Keep the `loadJSON` / `loadHTML` / `injectData` / `scaleSlides` shape stable.

### Regenerate `context`

- Keep the same section structure.
- Strengthen audience specificity, brand voice enforcement, visual constraints, AI instructions.
- Do not invent new sections.

### Regenerate `rules`

- Rules must be testable (yes/no answer per rule).
- Include both hard constraints and content/style rules.
- Reflect the rest of the project — no contradictions.

### Regenerate `meta`

- Update `version` (semver bump appropriate to scope).
- Refresh `generated_at` to the current ISO-8601 timestamp.
- Keep `project`, `output_target`, `format` unless those are explicitly changing.

### Regenerate `asset`

- Only touch the specific asset(s) requested.
- Preserve the asset path conventions (e.g. `assets/diagram.png`).
- If replacing an image placeholder in the content layer, update the content `image_placeholder` field to point at the new asset.

## Output contract reminder

The response is the JSON object. No markdown fences. No preamble. No
postamble. Every layer key from the user's input must appear in the
output — the AI's job is to preserve the unchanged layers verbatim.
