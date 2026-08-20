# Task: Generate a Full Project

Generate a complete MGF project from a project brief. The result must
be renderable immediately after the JSON is parsed and the files are
written.

## Input

Read the project's `context` first. It contains the brief, audience,
brand voice, output target, and AI instructions.

## Output

A single JSON object matching the schema in `standards/output-schema.md`.
The top-level keys must include:

- `style.css` — full `:root` token block (see `standards/tokens.md`).
- `layout.css` — full rule set for every `mgf-*` class (see `standards/classes.md`).
- `data.json` — full content schema (see `tasks/content.md`).
- `slide-NN.html` — one per slide, zero-padded two-digit numbers, starting at `slide-01.html`.
- `_meta` — project metadata, including `total_slides` matching the number of slide keys.

## Narrative arc

Choose components that serve a coherent story. The default arc is:

1. **Cover** — title, author, date.
2. **Problem** — the pain the audience feels.
3. **Solution** — the answer (text, image-text, or features).
4. **Proof** — stats, testimonial, or comparison.
5. **Closing** — call to action.

Deviate only when the brief makes a different arc more compelling. Do
not pad the deck with filler slides.

## Per-slide content rules

- Slide titles under 8 words.
- Body text under 40 words per slide.
- List items under 12 words each.
- Slide IDs sequential starting at 1.
- Each slide includes a `mgf-slide-number` element with `data-field="id"`.

## Style rules

- All `--mgf-*` variables declared in `standards/tokens.md` must be present.
- Accent pairings must pass WCAG AA contrast.
- `text-inverse` must work on accent backgrounds.

## Layout rules

- Layout defaults to 16:9 (1280 × 720). Adjust if the brief specifies a different format.
- Use the `mgf-*` grid / card classes for any multi-element layout. Do not stack everything in a single column.
- See `standards/layout-rules.md` for the anti-patterns.

## Output contract reminder

The response is the JSON object. No markdown fences. No preamble. No
postamble. The single outer JSON parser is the only thing that should
read this response.

## Output targets

The brief may specify one of these `output_target` values. Each has
its own conventions on top of the shared rules above:

| Target | Project type | Slide model | Notes |
| ------ | ------------ | ----------- | ----- |
| `presentation` | `presentation` / `carousel` | One viewport per slide | Keyboard nav (arrows / space), counter, deck export. |
| `website` | `website` | Slides stack into one scrolling page | One continuous scroll — no per-slide viewport. Layout uses `mgf-deck` or `mgf-full` blocks; each slide is a section in the page. |
| `poster` | `poster` | Single full-bleed slide | One slide only. Treat the whole canvas as a poster. |
| `infographic` | `infographic` | Scrollable vertical | Long-form with `mgf-stat-group`, `mgf-timeline`, `mgf-comparison`. |
| `document` | `document` | Scrollable | Reads top-to-bottom. Use `mgf-body` / `mgf-callout` for prose. |
| `landing-page` | `landing-page` | Scrollable with CTA anchors | Cover → features → social proof → pricing → CTA. `mgf-cta-solid` for the conversion button. |

When `output_target` is `website`, the renderer concatenates every
`slide-NN.html` into a single scrollable page inside the layout
wrapper (see `useAssemblePreview.ts`). The same `mgf-*` class
vocabulary applies, but each slide's section is just a block in the
page — there is no "advance to next slide" keyboard binding.

When `output_target` is one of the deck modes (`presentation`,
`carousel`), the renderer keeps one slide per viewport with keyboard
navigation and a slide counter. Use `mgf-slide-number` on every
slide.

## Math support

Slides may include KaTeX-rendered formulas. See `standards/math.md`
for the `<span class="math-inline">` / `<div class="math-block">`
conventions. The assembler only injects KaTeX assets when at least
one such tag is present in the rendered body, so deck projects
without math pay no asset cost.
