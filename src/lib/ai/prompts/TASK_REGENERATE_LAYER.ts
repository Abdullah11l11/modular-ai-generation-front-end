/** Regenerate a single layer (or a single slide within a layer) of an existing MGF project. */
export const TASK_REGENERATE_LAYER_PROMPT = `Regenerate one specific layer of an existing MGF project. The user will provide the current state of that layer and the new direction. Your job is to replace ONLY that layer — every other layer must stay byte-identical to what the user supplied.

## Input

The user will provide:
- The current project state (all eight layers: slide, style, layout, content, context, rules, meta, asset) or a focused subset
- The target layer to regenerate (one of: \`slide\`, \`style\`, \`layout\`, \`content\`, \`context\`, \`rules\`, \`meta\`, \`asset\`)
- The new direction (what should change and why)

## Per-Layer Rules

### Regenerate \`content\` (most common — single slide or full layer)
- If regenerating a single slide: only modify that slide's \`data\` object
- Do NOT change the \`id\`, \`component\` type, or any other slides
- Preserve the exact schema for the component type
- Keep slide title under 8 words
- Keep body text under 40 words
- Points/items should be under 12 words each
- Update \`_meta.total_slides\` only if the slide count actually changes

### Regenerate \`style\`
- Keep ALL \`--mgf-*\` variable names identical
- Only change the values
- Maintain WCAG AA contrast
- \`accent-2\` is a secondary accent color
- \`text-inverse\` must work on accent backgrounds

### Regenerate \`layout\`
- All \`.mgf-*\` class names must remain identical
- Only change: dimensions, padding, font sizes, grid columns, flex behavior
- Adjust \`--mgf-slide-w\`, \`--mgf-slide-h\`, \`--mgf-slide-pad-x\`, \`--mgf-slide-pad-y\` for the target format

### Regenerate \`slide\` (index.html / deck wiring)
- Keep class names from the layout layer
- Keep the \`data-field\` contract with the content layer
- Keep the \`loadJSON\` / \`loadHTML\` / \`injectData\` / \`scaleSlides\` shape stable

### Regenerate \`context\`
- Keep the same section structure
- Strengthen audience specificity, brand voice enforcement, visual constraints, AI instructions
- Do not invent new sections

### Regenerate \`rules\`
- Rules must be testable (yes/no answer per rule)
- Include both hard constraints and content/style rules
- Reflect the rest of the project — no contradictions

### Regenerate \`meta\`
- Update \`version\` (semver bump appropriate to scope)
- Refresh \`generated_at\` to the current ISO-8601 timestamp
- Keep \`project\`, \`output_target\`, \`format\` unless those are explicitly changing

### Regenerate \`asset\`
- Only touch the specific asset(s) requested
- Preserve the asset path conventions (e.g. \`assets/diagram.png\`)
- If replacing an image placeholder in the content layer, update the content \`image_placeholder\` field to point at the new asset

## Output

The response must contain one labeled code-fenced block per layer. The non-target layers must be returned verbatim from the user's input; only the target layer should differ.

### When the target layer is anything other than \`asset\`

Emit seven labeled code-fenced blocks — one for each of the other seven layers — each labeled with the layer name as the language tag (e.g., \`\`\`style\`, \`\`\`content\`, \`\`\`layout\`, \`\`\`slide\`, \`\`\`context\`, \`\`\`rules\`, \`\`\`meta\`). The block whose name matches the target layer holds the regenerated content; the other six hold the user's original content, unchanged. Order the blocks in the canonical layer order: slide, style, layout, content, context, rules, meta.

### When the target layer is \`asset\`

Emit a single \`\`\`asset code-fenced block listing the asset descriptors to add, remove, or replace, in the canonical layer order. Do not re-emit the other seven layers.

### Format rules

- Each block is a standalone, labeled code fence — do NOT wrap the entire response in a single outer code fence.
- The seven (or one) labeled blocks stand alone in plain markdown; the response is just the blocks.
- After the blocks, if the content or layout change affected component HTML files, list the updated files separately (same pattern as the full-project prompt).
- No preamble. No explanation of what was changed — just the labeled blocks.`;
