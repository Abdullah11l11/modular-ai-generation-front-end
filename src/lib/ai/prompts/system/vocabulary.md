# `mgf-*` Class Vocabulary — Reference

This is the authoritative list of every CSS class the AI may emit in a
component. A class is **in the vocabulary** when it appears here. A
class is **out of scope** otherwise — components must not invent new
class names.

For the rationale (why these classes, why this naming scheme) and the
list of design tokens they consume, see `standards/classes.md` and
`standards/tokens.md`. For layout rules around how to use these
classes without overflow or underflow, see `standards/layout-rules.md`.

## Layout primitives

`mgf-slide`, `mgf-deck`, `mgf-grid-2`, `mgf-grid-3`, `mgf-grid-4`,
`mgf-grid-auto`, `mgf-split-left`, `mgf-split-right`,
`mgf-split-60-40`, `mgf-split-40-60`, `mgf-full`, `mgf-overlap`,
`mgf-overlap-main`, `mgf-overlap-secondary`.

## Typography

`mgf-label`, `mgf-label-lg`, `mgf-eyebrow`, `mgf-title`,
`mgf-title-lg`, `mgf-title-xl`, `mgf-subtitle`, `mgf-body`,
`mgf-body-sm`, `mgf-caption`, `mgf-text-accent`, `mgf-text-muted`,
`mgf-text-inverse`, `mgf-text-bold`, `mgf-text-mono`, `mgf-text-center`,
`mgf-text-left`, `mgf-text-right`.

## Components

`mgf-card`, `mgf-card-hover`, `mgf-card-accent`, `mgf-card-solid`,
`mgf-card-label`, `mgf-card-value`, `mgf-accent-bar`, `mgf-accent-bar-lg`,
`mgf-divider`, `mgf-divider-short`, `mgf-list`, `mgf-list-check`,
`mgf-list-number`, `mgf-media`, `mgf-media-contained`, `mgf-media-rounded`,
`mgf-media-placeholder`, `mgf-stat-group`, `mgf-stat-value`,
`mgf-stat-value-lg`, `mgf-stat-label`, `mgf-chapter-number`,
`mgf-chapter-number-lg`, `mgf-cta`, `mgf-cta-solid`, `mgf-slide-number`,
`mgf-avatar`, `mgf-avatar-lg`, `mgf-avatar-xl`, `mgf-quote-mark`,
`mgf-quote-text`, `mgf-quote-author`, `mgf-quote-name`, `mgf-quote-title`,
`mgf-timeline`, `mgf-timeline-item`, `mgf-timeline-dot`, `mgf-steps`,
`mgf-step`, `mgf-step-number`, `mgf-step-connector`, `mgf-comparison`,
`mgf-comparison-col`, `mgf-comparison-header`, `mgf-feature-icon`,
`mgf-feature-title`, `mgf-feature-desc`, `mgf-team-grid`, `mgf-team-member`,
`mgf-team-name`, `mgf-team-role`, `mgf-team-bio`, `mgf-badge`,
`mgf-badge-accent`, `mgf-badge-success`, `mgf-badge-warning`,
`mgf-badge-muted`, `mgf-video-container`, `mgf-video-placeholder`,
`mgf-table`, `mgf-faq-item`, `mgf-faq-q`, `mgf-faq-a`, `mgf-callout`,
`mgf-callout-info`, `mgf-callout-success`, `mgf-callout-warning`,
`mgf-callout-icon`, `mgf-callout-text`, `mgf-price`, `mgf-price-period`,
`mgf-form`, `mgf-input`, `mgf-map-container`, `mgf-chart`,
`mgf-chart-bar`, `mgf-chart-label`, `mgf-icon`, `mgf-icon-lg`.

## Backgrounds

`mgf-bg-surface`, `mgf-bg-gradient`, `mgf-bg-accent`, `mgf-bg-accent-soft`.

## Layout utilities

`mgf-pad-sm`, `mgf-pad-md`, `mgf-pad-lg`, `mgf-mt-sm`, `mgf-mt-md`,
`mgf-mt-lg`, `mgf-mb-sm`, `mgf-mb-md`, `mgf-mb-lg`, `mgf-gap-sm`,
`mgf-gap-md`, `mgf-gap-lg`, `mgf-flex`, `mgf-flex-col`, `mgf-flex-center`,
`mgf-flex-between`, `mgf-flex-start`, `mgf-flex-wrap`.

## Default sizes

The classes below carry a default size baked into the layout layer. The
AI must not override them with inline styles.

| Class             | Default size |
| ----------------- | ------------ |
| `mgf-label`       | 11px         |
| `mgf-eyebrow`     | 11px         |
| `mgf-caption`     | 11px         |
| `mgf-body-sm`     | 13px         |
| `mgf-body`        | 15px         |
| `mgf-subtitle`    | 18px         |
| `mgf-title`       | 28px         |
| `mgf-card-value`  | 30px         |
| `mgf-title-lg`    | 36px         |
| `mgf-stat-value`  | 48px         |
| `mgf-title-xl`    | 48px         |
| `mgf-stat-value-lg` | 72px       |

## Layout contract

Every `mgf-slide` is a fixed canvas with `width: var(--mgf-slide-w)`,
`height: var(--mgf-slide-h)`, `padding: var(--mgf-slide-pad-y)
var(--mgf-slide-pad-x)`, `box-sizing: border-box`, and
`overflow: hidden`. The content inside must fit between the padded
edges. See `standards/layout-rules.md` for the full invariants.
