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

Output the complete updated project, with ONLY the targeted layer changed. The other seven layers must be returned verbatim from the user's input. Use a single markdown response with seven code-fenced blocks (one per layer except \`asset\`), each labeled with the layer name. After the seven blocks, list any updated component HTML files if the content or layout change affected them.

No markdown code fences around the response. No preamble. No explanation of what was changed — just the updated project.`;
