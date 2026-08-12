# `mgf-*` Class Vocabulary

The single source of truth for every CSS class an AI may emit in a
component. A class is **in the vocabulary** when it appears in this
file. A class is **out of scope** otherwise — components must not
invent new class names.

## Layout primitives

| Class                       | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| `mgf-slide`                 | Root element of every slide. One per component file.      |
| `mgf-deck`                  | Wrapper for a series of slides.                           |
| `mgf-grid-2`                | Two-column grid. Auto-fit on narrow widths.               |
| `mgf-grid-3`                | Three-column grid.                                       |
| `mgf-grid-4`                | Four-column grid.                                         |
| `mgf-grid-auto`             | `auto-fit minmax(220px, 1fr)` — natural‐width columns.    |
| `mgf-split-left`            | 50/50 split, image on the left.                           |
| `mgf-split-right`           | 50/50 split, image on the right.                          |
| `mgf-split-60-40`           | Asymmetric 60/40 split.                                   |
| `mgf-split-40-60`           | Asymmetric 40/60 split.                                   |
| `mgf-full`                  | Absolute fill of the parent slide.                        |
| `mgf-overlap`               | Stacked overlapping layout.                               |
| `mgf-overlap-main`          | Top layer of an overlap.                                  |
| `mgf-overlap-secondary`     | Bottom layer of an overlap.                               |

## Typography

| Class                | Default size | Notes                                        |
| -------------------- | ------------ | -------------------------------------------- |
| `mgf-label`          | 11px         | Uppercase eyebrow.                           |
| `mgf-label-lg`       | 13px         | Larger eyebrow.                              |
| `mgf-eyebrow`        | 11px         | Bold, tracked, accent color.                 |
| `mgf-title`          | 28px         | Main heading.                                |
| `mgf-title-lg`       | 36px         | Hero heading.                                |
| `mgf-title-xl`       | 48px         | Cover / display heading.                     |
| `mgf-subtitle`       | 18px         | Subtitle below the title.                    |
| `mgf-body`           | 15px         | Body paragraph.                              |
| `mgf-body-sm`        | 13px         | De-emphasized body.                          |
| `mgf-caption`        | 11px         | Footer / supporting text.                    |
| `mgf-text-accent`    | —            | Color: `var(--mgf-color-accent)`.            |
| `mgf-text-muted`     | —            | Color: `var(--mgf-color-text-secondary)`.    |
| `mgf-text-inverse`   | —            | Color: `var(--mgf-color-text-inverse)`.      |
| `mgf-text-bold`      | —            | Font-weight 700.                             |
| `mgf-text-mono`      | —            | Font: `var(--mgf-font-mono)`.                |
| `mgf-text-center`    | —            | `text-align: center`.                        |
| `mgf-text-left`      | —            | `text-align: left`.                          |
| `mgf-text-right`     | —            | `text-align: right`.                         |

## Components

| Class                       | Purpose                                              |
| --------------------------- | ---------------------------------------------------- |
| `mgf-card`                  | Bordered surface.                                    |
| `mgf-card-hover`            | Card with hover lift.                                |
| `mgf-card-accent`           | Card with left accent border.                        |
| `mgf-card-solid`            | Card with solid background, no border.               |
| `mgf-card-label`            | Small label inside a card.                           |
| `mgf-card-value`            | Large value inside a card.                           |
| `mgf-accent-bar`            | 4px horizontal accent bar.                           |
| `mgf-accent-bar-lg`         | 6px bold accent bar.                                 |
| `mgf-divider`               | Full-width horizontal rule.                          |
| `mgf-divider-short`         | Short horizontal rule.                               |
| `mgf-list`                  | Bulleted list.                                       |
| `mgf-list-check`            | List with checkmark bullets.                         |
| `mgf-list-number`           | Numbered list.                                       |
| `mgf-media`                 | 16:9 image / video container.                        |
| `mgf-media-contained`       | Aspect-locked media.                                 |
| `mgf-media-rounded`         | Circular media.                                      |
| `mgf-media-placeholder`     | Fallback shown until image asset loads.              |
| `mgf-stat-group`            | Grid of stats.                                       |
| `mgf-stat-value`            | Big metric number.                                   |
| `mgf-stat-value-lg`         | Hero-scale metric.                                   |
| `mgf-stat-label`            | Metric label below the value.                        |
| `mgf-chapter-number`        | Section number chip.                                 |
| `mgf-chapter-number-lg`     | Section number chip, large.                          |
| `mgf-cta`                   | Underline link.                                      |
| `mgf-cta-solid`             | Solid button.                                        |
| `mgf-slide-number`          | Bottom-right counter.                                |
| `mgf-avatar` / `-lg` / `-xl`| Photo circle.                                        |
| `mgf-quote-mark`            | Large quotation mark.                                |
| `mgf-quote-text`            | Italic quote body.                                   |
| `mgf-quote-author`          | Author row.                                          |
| `mgf-quote-name`            | Author name.                                         |
| `mgf-quote-title`           | Author title/company.                                |
| `mgf-timeline`              | Timeline container.                                  |
| `mgf-timeline-item`         | Single timeline row.                                 |
| `mgf-timeline-dot`          | Dot on the timeline axis.                            |
| `mgf-steps`                 | Process steps container.                             |
| `mgf-step`                  | Single step.                                         |
| `mgf-step-number`           | Step number badge.                                   |
| `mgf-step-connector`        | Connector between steps.                             |
| `mgf-comparison`            | Two-column comparison.                               |
| `mgf-comparison-col`        | Single comparison column.                            |
| `mgf-comparison-header`     | Comparison column header.                            |
| `mgf-feature-icon`          | Feature block icon.                                  |
| `mgf-feature-title`         | Feature block title.                                 |
| `mgf-feature-desc`          | Feature block description.                           |
| `mgf-team-grid`             | Team grid container.                                 |
| `mgf-team-member`           | Single team member card.                             |
| `mgf-team-name`             | Member name.                                         |
| `mgf-team-role`             | Member role.                                         |
| `mgf-team-bio`              | Member bio.                                          |
| `mgf-badge`                 | Tag chip.                                            |
| `mgf-badge-accent` / `-success` / `-warning` / `-muted` | Variant chips.       |
| `mgf-video-container`       | Video frame.                                         |
| `mgf-video-placeholder`     | Video placeholder.                                   |
| `mgf-table`                 | Data table.                                          |
| `mgf-faq-item`              | FAQ row.                                             |
| `mgf-faq-q`                 | FAQ question.                                        |
| `mgf-faq-a`                 | FAQ answer.                                          |
| `mgf-callout`               | Alert box.                                           |
| `mgf-callout-info` / `-success` / `-warning` | Variants.                       |
| `mgf-callout-icon`          | Callout icon.                                        |
| `mgf-callout-text`          | Callout body.                                        |
| `mgf-price`                 | Pricing tier value.                                  |
| `mgf-price-period`          | Pricing period suffix.                               |
| `mgf-form` / `mgf-input`    | Form elements.                                       |
| `mgf-map-container`         | Map frame.                                           |
| `mgf-chart`                 | Bar chart container.                                 |
| `mgf-chart-bar`             | Bar chart bar.                                       |
| `mgf-chart-label`           | Bar chart label.                                     |
| `mgf-icon` / `mgf-icon-lg`  | Icon container.                                      |

## Backgrounds

| Class                  | Notes                                       |
| ---------------------- | ------------------------------------------- |
| `mgf-bg-surface`       | `var(--mgf-color-surface)` background.      |
| `mgf-bg-gradient`      | Linear gradient using surface and accent.   |
| `mgf-bg-accent`        | Accent background.                          |
| `mgf-bg-accent-soft`   | Soft accent background.                     |

## Layout utilities

| Class                          | Notes                                |
| ------------------------------ | ------------------------------------ |
| `mgf-pad-sm` / `-md` / `-lg`   | Padding scale.                       |
| `mgf-mt-sm` / `-md` / `-lg`    | Margin-top scale.                    |
| `mgf-mb-sm` / `-md` / `-lg`    | Margin-bottom scale.                 |
| `mgf-gap-sm` / `-md` / `-lg`   | Flex/grid gap scale.                 |
| `mgf-flex` / `-col` / `-center` / `-between` / `-start` / `-wrap` | Flex utilities. |

## Website (scrollable page archetype)

Used in the `website` archetype only. Each `slide-NN.html` is a
section in a long-scroll page (see `website.md` for full recipes).
Decks (presentation / carousel) must not emit these.

| Class                          | Purpose                              |
| ------------------------------ | ------------------------------------ |
| `mgf-website`                  | Root page wrapper.                   |
| `mgf-website-nav`              | Top navigation bar.                  |
| `mgf-website-brand`            | Brand link in the nav.               |
| `mgf-website-links`            | Right-side nav links container.      |
| `mgf-website-footer`           | Bottom-of-page footer band.          |
| `mgf-website-hero`             | First section, full-width hero band. |
| `mgf-website-hero-title`       | Hero headline (oversized type).      |
| `mgf-website-hero-sub`         | Hero subheadline.                    |
| `mgf-website-hero-ctas`        | Hero primary + secondary CTA row.    |
| `mgf-website-section`          | Every section band after the hero.   |
| `mgf-website-section-header`   | Section eyebrow + title + sub stack. |
| `mgf-website-section-title`    | Section H2 (large but not hero-sized). |
| `mgf-website-section-sub`      | Section subtitle / framing line.     |
| `mgf-website-testimonial`      | Centered testimonial container.      |
| `mgf-website-faq`              | Narrow centered FAQ column.          |
| `mgf-website-cta`              | Closing CTA band container.          |
| `mgf-website-cta-title`        | Closing CTA headline.                |
| `mgf-website-cta-body`         | Closing CTA supporting body.         |
| `mgf-cta-lg`                   | Larger CTA button (hero / closing CTA). |

## Math (KaTeX)

Both deck and website archetypes may include scientific formulas.
See `math.md` for the full contract.

| Class                          | Purpose                              |
| ------------------------------ | ------------------------------------ |
| `math-inline`                  | Inline math span; KaTeX renders `data-tex`. |
| `math-block`                   | Block-level math div; KaTeX renders `data-tex` in display mode. |
