# `mgf-*` Class Vocabulary

The single source of truth for every CSS class an AI may emit in a
component. A class is **in the vocabulary** when it appears in this
file. A class is **out of scope** otherwise — components must not
invent new class names.

All class rules are defined in `src/features/editor/lib/baseCss.ts`,
which is injected into every preview at assembly time. Components are
not required to redefine any of these — they only need to use the class
name on an element and the framework handles the visual.

Two patterns repeat throughout:

- **Token fallback**: every color / size / font references a
  `--mgf-*` CSS variable with a hard-coded fallback
  (`var(--mgf-color-accent, #22D3EE)`). A project may override the
  variable in its `style.css`; if it does not, the fallback wins.
- **Logical properties**: padding / margin / border use logical
  properties (`padding-inline`, `border-inline-start`,
  `inset-inline-start`) so RTL projects mirror for free. Only a
  handful of rules in `baseCss.ts` still use physical `left`/`right`
  and need explicit RTL overrides — see the RTL section.

## Layout primitives

| Class                       | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| `mgf-slide`                 | Root element of every slide. One per component file.      |
| `mgf-deck`                  | Wrapper for a series of slides.                           |
| `mgf-deck-vertical`         | Vertical deck with gaps between slides.                   |
| `mgf-deck-dots`             | Dot row beneath a deck (one dot per slide).               |
| `mgf-deck-progress`         | Sticky 3px progress bar at the top of a deck.             |
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

### Slide sizes

| Class                          | Purpose                                |
| ------------------------------ | -------------------------------------- |
| `mgf-slide-size-16x9`          | Aspect-locked 16:9 slide.              |
| `mgf-slide-size-4x3`           | Aspect-locked 4:3 slide.               |
| `mgf-slide-size-a4`            | A4 portrait slide.                     |
| `mgf-slide-size-square`        | 1:1 slide.                             |

### Carousel

| Class                       | Purpose                                              |
| --------------------------- | ---------------------------------------------------- |
| `mgf-carousel`              | Horizontally-scrolling snap carousel container.      |
| `mgf-carousel-track`        | Inner flex track holding items.                      |
| `mgf-carousel-item`         | Single snap-aligned item.                            |
| `mgf-carousel-dots`         | Dot row beneath the carousel.                        |

### Dashboard / infographic

| Class                       | Purpose                                              |
| --------------------------- | ---------------------------------------------------- |
| `mgf-dashboard`             | Dashboard page chrome.                               |
| `mgf-dash-grid`             | 12-column dashboard grid.                            |
| `mgf-dash-cell`             | Grid cell with `--col` / `--row` span variables.     |
| `mgf-dash-card`             | Bordered dashboard card.                             |
| `mgf-widget`                | Surface-2 widget panel.                              |
| `mgf-infographic`           | 12-column infographic canvas (min 400px tall).       |
| `mgf-infographic-flow`      | Flow connector layer (positions children).           |

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
| `mgf-mono`           | —            | Shorthand for monospace font.                |

## Surfaces (cards, stats, KPI)

### Cards

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-card`           | Bordered surface (default).                               |
| `mgf-card-hover`     | Card with hover lift + shadow.                            |
| `mgf-card-accent`    | Card with accent border + surface-2 background.           |
| `mgf-card-solid`     | Card with solid background, no border.                    |
| `mgf-card-glass`     | Card with glassmorphism (transparent + backdrop-blur).    |
| `mgf-card-neo`       | Card with neo-brutal offset shadow.                       |
| `mgf-card-label`     | Small label inside a card.                                |
| `mgf-card-value`     | Large value inside a card.                                |
| `mgf-card-title`     | Card heading.                                             |
| `mgf-card-body`      | Card body text.                                           |
| `mgf-card-footer`    | Card footer row (border-top, mt-auto).                    |

### Stats

| Class                       | Purpose                                              |
| --------------------------- | ---------------------------------------------------- |
| `mgf-stat-group`            | Grid of stats.                                       |
| `mgf-stat`                  | Single stat card (label + value).                    |
| `mgf-stat-value`            | Big metric number.                                   |
| `mgf-stat-value-lg`         | Hero-scale metric (clamp 2.5–4rem).                   |
| `mgf-stat-label`            | Metric label below the value.                        |
| `mgf-stat-sub`              | Optional supporting copy below the label.            |

### KPI

| Class                | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `mgf-kpi`            | Compact KPI block (label + value).                       |
| `mgf-kpi-value`      | Big metric value.                                        |
| `mgf-kpi-label`      | Small label above / below the value.                     |

## Quote / testimonial / avatar

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-testimonial`    | Single centered testimonial.                              |
| `mgf-testimonial-grid` | Grid of testimonials.                                   |
| `mgf-quote`          | Pull-quote with `border-inline-start` accent line.        |
| `mgf-quote-mark`     | Large quotation mark.                                     |
| `mgf-quote-text`     | Italic quote body.                                        |
| `mgf-quote-author`   | Author row.                                               |
| `mgf-quote-name`     | Author name.                                              |
| `mgf-quote-title`    | Author title/company.                                     |
| `mgf-quote-avatar`   | 40px circular avatar slot.                                |
| `mgf-avatar`         | Photo circle (40px).                                      |
| `mgf-avatar-lg`      | Photo circle (64px).                                      |
| `mgf-avatar-xl`      | Photo circle (96px).                                      |

## Code

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-code`           | Inline monospace snippet.                                 |
| `mgf-code-card`      | Code block frame (header + body).                         |
| `mgf-code-card-header` | Header bar with title + window dots.                    |
| `mgf-code-card-title` | File name in the header bar.                             |
| `mgf-code-card-dots`  | Three macOS-style window dots.                           |
| `mgf-code-card-body`   | `<pre><code>` body.                                     |
| `mgf-code-lang`       | Language label.                                          |
| `mgf-code-keyword`    | Token highlight: keyword.                                |
| `mgf-code-string`     | Token highlight: string.                                 |
| `mgf-code-comment`    | Token highlight: comment (italic).                        |
| `mgf-code-fn`         | Token highlight: function call.                          |

## Callout / list / badge / tag

### Callout

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-callout`        | Bordered alert box.                                       |
| `mgf-callout-info`   | Accent (cyan) border-inline-start.                        |
| `mgf-callout-success` | Green border-inline-start.                               |
| `mgf-callout-warning` | Amber border-inline-start.                               |
| `mgf-callout-danger`  | Red border-inline-start.                                 |
| `mgf-callout-icon`   | Callout icon.                                             |
| `mgf-callout-title`  | Callout heading.                                          |
| `mgf-callout-text`   | Callout body.                                             |

### List

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-list`           | Bulleted list (accent dot).                               |
| `mgf-list-plain`     | Plain list (no bullets).                                   |
| `mgf-list-check`     | List with checkmark bullets.                              |
| `mgf-list-number`    | Numbered list (`list-style: decimal`).                    |
| `mgf-list-icon`      | List with custom icons (no default bullet).               |

### Badge / tag

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-badge`          | Pill chip.                                                |
| `mgf-badge-accent`   | Accent fill.                                              |
| `mgf-badge-success`  | Green tint.                                               |
| `mgf-badge-warning`  | Amber tint.                                               |
| `mgf-badge-muted`    | Muted gray.                                               |
| `mgf-tag`            | Small rectangular tag (uppercase, tracked).                  |

## Hero / section / divider / accent bar / chapter

### Hero

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-hero`           | Hero block.                                               |
| `mgf-hero-media`     | 16:9 media slot at the top.                               |
| `mgf-hero-title`     | Hero headline.                                            |
| `mgf-hero-sub`       | Hero sub.                                                 |
| `mgf-hero-ctas`      | Row of CTAs.                                              |

### Section

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-section`        | Generic section padding + stack.                          |
| `mgf-section-header` | Eyebrow + title + sub stack.                              |
| `mgf-section-title`  | Section H2.                                               |
| `mgf-section-sub`    | Section sub.                                              |

### Divider / accent bar / chapter

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-divider`        | Full-width horizontal rule.                               |
| `mgf-divider-short`  | 60px accent rule.                                         |
| `mgf-accent-bar`     | 4px horizontal accent bar.                                |
| `mgf-accent-bar-lg`  | 6px bold accent bar.                                      |
| `mgf-chapter-num`    | 32px section number chip.                                 |
| `mgf-chapter-num-lg` | 64px section number chip.                                 |
| `mgf-chapter-number` | Legacy alias for `mgf-chapter-num`.                       |
| `mgf-chapter-number-lg` | Legacy alias for `mgf-chapter-num-lg`.                 |

## Nav / footer

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-nav`            | Top nav (deck archetype).                                 |
| `mgf-nav-brand`      | Brand link inside `mgf-nav`.                              |
| `mgf-nav-links`      | Right-aligned link row.                                   |
| `mgf-footer`         | Page footer band.                                         |
| `mgf-footer-text`    | Footer copy.                                              |
| `mgf-footer-links`   | Footer link row.                                          |

## CTA

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-cta`            | Underline link.                                           |
| `mgf-cta-solid`      | Solid pill button.                                        |
| `mgf-cta-lg`         | Larger CTA button (hero / closing CTA).                   |

## Bento / marquee / spotlight / marks

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-bento`          | 12-column bento grid.                                     |
| `mgf-bento-item`     | Bento cell with `--span` variable.                        |
| `mgf-marquee`        | Horizontal-scrolling marquee viewport.                    |
| `mgf-marquee-track`  | Inner flex track (animation: marquee-scroll 25s).         |
| `mgf-marquee-item`   | Single marquee chip.                                      |
| `mgf-spotlight`      | Spotlight panel with radial accent glow.                  |
| `mgf-marks`          | Logo / brand marks grid.                                  |
| `mgf-mark`           | Single logo mark cell.                                    |

## Timeline / steps / comparison

| Class                       | Purpose                                              |
| --------------------------- | ---------------------------------------------------- |
| `mgf-timeline`              | Timeline container (border-inline-start axis).       |
| `mgf-timeline-item`         | Single timeline row.                                 |
| `mgf-timeline-dot`          | Dot on the timeline axis.                            |
| `mgf-timeline-content`      | Body content within an item.                         |
| `mgf-steps`                 | Process steps container.                             |
| `mgf-step`                  | Single step.                                         |
| `mgf-step-num`              | Step number badge (28×28 circle).                    |
| `mgf-step-connector`        | Connector between steps.                             |
| `mgf-comparison`            | Two-column comparison.                               |
| `mgf-comparison-col`        | Single comparison column.                            |
| `mgf-comparison-header`     | Comparison column header.                            |

## Feature / team / table / FAQ / pricing / media

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-feature-icon`   | Feature block icon.                                       |
| `mgf-feature-title`  | Feature block title.                                      |
| `mgf-feature-desc`   | Feature block description.                                |
| `mgf-team-grid`      | Team grid container.                                      |
| `mgf-team-member`    | Single team member card.                                  |
| `mgf-team-name`      | Member name.                                              |
| `mgf-team-role`      | Member role.                                              |
| `mgf-team-bio`       | Member bio.                                            |
| `mgf-table`          | Data table.                                               |
| `mgf-faq`            | FAQ stack.                                                 |
| `mgf-faq-item`       | FAQ row.                                                  |
| `mgf-faq-q`          | FAQ question.                                             |
| `mgf-faq-a`          | FAQ answer.                                               |
| `mgf-price`          | Pricing tier value.                                       |
| `mgf-price-period`   | Pricing period suffix.                                    |
| `mgf-form` / `mgf-input` | Form elements.                                        |
| `mgf-map-container`  | Map frame.                                                |
| `mgf-video-container` | Video frame.                                            |
| `mgf-video-placeholder` | Video placeholder.                                    |
| `mgf-media`          | 16:9 image / video container.                             |
| `mgf-media-contained` | Aspect-locked media.                                    |
| `mgf-media-rounded`  | Circular media.                                           |
| `mgf-media-placeholder` | Fallback shown until image asset loads.                |
| `mgf-slide-number`   | Bottom-right counter.                                     |
| `mgf-icon` / `mgf-icon-lg` | Icon container.                                     |

## Charts (CSS-only, zero JS)

Charts use a hybrid model: bars, pies, donuts, stacked bars, horizontal
bars and heatmaps are pure CSS (driven by inline `--val`, `--seg`,
`--slices`, `--heat` variables). Line, area, gauge and radar expect
hand-authored `<svg>` — the classes style `stroke` / `fill` against
`--mgf-color-accent` but the author controls the geometry.

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-chart`          | Bordered chart frame.                                      |
| `mgf-chart-title`    | Chart heading.                                            |
| `mgf-chart-legend`   | Legend row beneath the title.                             |
| `mgf-legend-item`    | Legend swatch + label (color via `--legend`).             |
| `mgf-chart-svg`      | Wrapper for hand-authored `<svg>`.                        |
| `mgf-chart-bar`      | Vertical bar chart row.                                   |
| `mgf-bar`            | Single vertical bar (height: `var(--val, 0%)`).           |
| `mgf-bar-label`      | Label below a bar.                                        |
| `mgf-bar-value`      | Value above a bar.                                        |
| `mgf-chart-stacked`  | Stacked vertical bar container.                           |
| `mgf-bar-stack`      | Single stack (height: `var(--val, 50%)`).                 |
| `mgf-seg`            | Segment within a stack (flex: `var(--seg, 1)`).           |
| `mgf-seg-1` / `-2` / `-3` / `-4` | Default segment colors (accent / amber / green / purple). |
| `mgf-chart-hbar`     | Horizontal bar chart column.                              |
| `mgf-hbar`           | Single horizontal bar (width: `var(--val, 0%)`).          |
| `mgf-hbar-label`     | Label for a horizontal bar.                               |
| `mgf-chart-pie`      | 160×160 pie chart (conic-gradient via `--slices`).        |
| `mgf-chart-donut`    | Pie variant with hollow center.                           |
| `mgf-pie-center`     | Center label inside a donut.                              |
| `mgf-heatmap`        | N-column heatmap grid (column count via `--cols`).        |
| `mgf-heat-cell`      | Heatmap cell (intensity via `--heat` 0..1).               |
| `mgf-sparkline`      | `<svg>` class — `path` styled with accent stroke.         |
| `mgf-line`           | `<svg>` line class — `path` stroked, optional `.mgf-area-fill`. |
| `mgf-area`           | `<svg>` area class — filled with 30%-accent tint.         |
| `mgf-gauge`          | `<svg>` gauge class — `.mgf-gauge-needle` styled.         |
| `mgf-radar`          | `<svg>` radar class — `.mgf-radar-grid` + `.mgf-radar-shape`. |
| `mgf-axis-label`     | `<svg>` axis label (uses `fill`, not `color`).            |

### Chart authoring cheatsheet

```html
<!-- Bar: each child sets --val="42%" -->
<div class="mgf-chart-bar">
  <div><div class="mgf-bar" style="--val: 80%"></div><div class="mgf-bar-value">80</div></div>
  <div><div class="mgf-bar" style="--val: 60%"></div><div class="mgf-bar-value">60</div></div>
</div>

<!-- Pie / donut: --slices is a conic-gradient string -->
<div class="mgf-chart-pie mgf-chart-donut"
     style="--slices: conic-gradient(#22D3EE 0% 35%, #fbbf24 35% 60%, #4ade80 60% 100%)">
  <div class="mgf-pie-center">3</div>
</div>

<!-- Heatmap: --cols for column count, --heat 0..1 per cell -->
<div class="mgf-heatmap" style="--cols: 7">
  <div class="mgf-heat-cell" style="--heat: 0.1"></div>
  <div class="mgf-heat-cell" style="--heat: 0.4"></div>
  …
</div>
```

## Background patterns

All patterns set `background-image` and layer over `--mgf-color-bg`.
Built with `color-mix` of the text color so they stay subtle on light
AND dark themes.

| Class                       | Purpose                                              |
| --------------------------- | ---------------------------------------------------- |
| `mgf-bg-grid`              | 32px grid.                                           |
| `mgf-bg-grid-fine`         | 16px grid (denser).                                  |
| `mgf-bg-grid-lg`           | 64px grid (sparser).                                 |
| `mgf-bg-dots`              | 24px dot grid.                                       |
| `mgf-bg-lines`             | 14px diagonal stripe.                                |
| `mgf-bg-gradient`          | Vertical surface→bg gradient.                        |
| `mgf-bg-gradient-accent`   | 135° accent→transparent gradient.                    |
| `mgf-bg-surface`           | Solid surface background.                            |
| `mgf-bg-accent`            | Solid accent background (inverse text).              |
| `mgf-bg-accent-soft`       | Soft accent tint.                                    |

## Frames

Decorative inner borders for hero / showcase panels. `pointer-events:
none` so they never intercept clicks.

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-frame`          | Single inset border (1px, 12% text).                     |
| `mgf-frame-accent`   | Single inset border (2px, accent).                       |
| `mgf-frame-double`   | Two concentric inset borders (1px + 1px 6px).             |

## Modifiers (compose with any theme/element)

These are cosmetic accents — compose with a base surface (`.mgf-card`,
`.mgf-hero`, etc.) to retune its look. They do not introduce a new
visual primitive on their own.

| Class                | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `mgf-brutal-border`  | 3px solid border + 6px offset shadow (neo-bru).           |
| `mgf-glass`          | Translucent surface + backdrop-blur.                      |
| `mgf-neo`            | Surface + 4px offset shadow (neo-bru).                    |
| `mgf-neo-inset`      | Surface + inset shadow (pressed-in look).                 |
| `mgf-grain`          | Overlay noise via `feTurbulence` SVG.                     |
| `mgf-grain-heavy`    | Stronger grain (opacity 0.9).                             |
| `mgf-grain-soft`     | Lighter grain (opacity 0.3).                             |
| `mgf-grain-none`     | Suppress grain on a child of a grain container.           |
| `mgf-ambient-glow`   | Soft accent glow via radial-gradient pseudo-element.     |
| `mgf-dense`          | Tighten spacing (override `--mgf-space-*`).               |
| `mgf-air`            | Loosen spacing.                                            |
| `mgf-hi`             | Higher contrast + saturation (filter).                    |
| `mgf-lo`             | Lower contrast + saturation.                              |
| `mgf-accent-1`       | Text color: `--mgf-color-accent`.                         |
| `mgf-accent-2`       | Text color: `--mgf-color-accent-2`.                       |
| `mgf-display-serif`  | Display font: `--mgf-font-serif`.                         |
| `mgf-display-mono`   | Display font: `--mgf-font-mono`.                          |
| `mgf-body-serif`     | Body font: `--mgf-font-serif`.                            |
| `mgf-body-mono`      | Body font: `--mgf-font-mono`.                             |
| `mgf-flat`           | Strip shadow / filter (used to neutralize a parent).      |

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

## Math (KaTeX)

Both deck and website archetypes may include scientific formulas.
See `math.md` for the full contract.

| Class                          | Purpose                              |
| ------------------------------ | ------------------------------------ |
| `math-inline`                  | Inline math span; KaTeX renders `data-tex`. |
| `math-block`                   | Block-level math div; KaTeX renders `data-tex` in display mode. |

## RTL

Most classes use logical properties and mirror automatically under
`[dir="rtl"]`. A handful of rules in `baseCss.ts` still use physical
`left`/`right` and have explicit RTL overrides — see the comment block
at the bottom of `baseCss.ts`. Add a new override there whenever a
project goes RTL and the visual layout breaks.