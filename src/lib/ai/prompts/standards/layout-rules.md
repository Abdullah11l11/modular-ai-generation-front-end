# Layout Rules

These rules exist because AI-generated slides consistently fail by
**overflowing** (text bleeds outside the slide frame) or **underflowing**
(white space piles up at the bottom). Both failures come from the same
root cause: the slide has a fixed canvas (`--mgf-slide-w` × `--mgf-slide-h`)
but the content inside it has no upper bound, so a long body pushes the
title off-screen while the slide number stays anchored at the bottom.

The fix is structural, not cosmetic. Every slide must respect five
invariants. The renderer is responsible for the canvas; the AI is
responsible for fitting content inside it.

## Invariant 1 — the slide is a viewport, not a flex item

`.mgf-slide` has fixed dimensions (`width: var(--mgf-slide-w);
height: var(--mgf-slide-h)`) and `overflow: hidden`. Anything that
cannot fit is clipped, not scrolled. The AI must compress content
(it can shorten text, reduce stack sizes, or pick a different layout)
rather than hope the slide gets taller.

## Invariant 2 — vertical content fits between the padded edges

The slide's inner content area is `slide-w × slide-h` minus the
padding (`--mgf-slide-pad-x` on the sides, `--mgf-slide-pad-y` top
and bottom). For a 16:9 presentation (`1280×720`, padding 80×60) the
content area is 1120×600 — about 600px tall total.

A safe per-slide content budget is:

- 1 eyebrow (`mgf-label`, 11px, ~16px line)
- 1 title (`mgf-title`, 28px, ~32px line)
- 1 subtitle (`mgf-subtitle`, 18px, ~24px line)
- Up to 5 body lines (`mgf-body`, 15px, ~23px line)
- 1 slide number (`mgf-slide-number`, 11px, ~16px line)
- gaps between blocks (`mgf-gap-md`, 16px each)

If the design needs more, swap to a grid (`mgf-grid-2`, `mgf-grid-3`)
or a stat group (`mgf-stat-group`). Do not stack everything in one
column.

## Invariant 3 — cards distribute, they don't stretch

A row of cards must use `mgf-grid-2`, `mgf-grid-3`, or
`mgf-grid-auto`. The grid enforces equal widths and natural heights
— the AI never has to compute them. The card surface is
`mgf-card` (see `classes.md`). Inside each card:

- 1 label (`mgf-card-label`, 11px)
- 1 value (`mgf-card-value`, 30px)
- optional body line (`mgf-body-sm`, 13px)

Never put a card inside a card. Never nest a grid inside a card.

## Invariant 4 — text wraps, never overflows

Lines over ~60 characters become hard to read at presentation
distances. The AI should keep titles under 8 words, body under 40
words, and individual list items under 12 words. The renderer's
`overflow: hidden` will clip longer text, but the AI should not
rely on that — the presentation will look broken.

## Invariant 5 — the slide number sits at the bottom

Every slide includes `mgf-slide-number` with a `data-field="id"`
attribute. The renderer injects the slide number, zero-padded to
two digits (`01`, `02`, …). The element must be the **last** child
of `mgf-slide` so flexbox `margin-top: auto` pushes it to the bottom.

## Anti-patterns

These are mistakes AI tend to make. Avoid them.

| Anti-pattern                                         | Fix                                                        |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| Title text longer than 8 words                        | Shorten, or move to a subtitle.                            |
| Six bullets stacked vertically                        | Use `mgf-grid-2` (3×2) or `mgf-grid-3` (2×3).              |
| An image that fills the slide with text on top       | Use `mgf-split-left` / `mgf-split-right` instead.           |
| A stat value rendered as `mgf-title-xl` (48px) inside a card | Use `mgf-card-value` (30px) — it's already large.       |
| Twelve icons in a row                                | Use `mgf-grid-4` or `mgf-grid-3`; never inline them.       |
| Centered text block with no max-width                | Wrap in a `mgf-grid-2`; the column auto-caps width.        |
| Slide number rendered at the top                     | Last child of `mgf-slide` only.                            |
| Responsive rules (`@media`, `min-width`)             | Layouts are fixed-canvas. The renderer scales; do not add media queries. |
| Inline `style="..."`                                 | Use token classes from `classes.md` instead.               |
| Hardcoded hex color                                  | Use `var(--mgf-color-*)` from `tokens.md`.                  |
| Custom Tailwind utilities (`flex`, `gap-4`, `bg-*`)  | Use the `mgf-*` vocabulary.                                |
