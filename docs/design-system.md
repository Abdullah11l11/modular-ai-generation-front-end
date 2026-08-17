# MGF Design System

> **Audience.** This is the canonical reference for the **modular-ai-generation-front-end** design vocabulary. Hand it to any generator — your own backend agent, another LLM, a human designer — and they can build a coherent slide / page / dashboard from scratch without ever reading the editor source. Every claim here is verifiable against the source of truth: `src/features/editor/lib/baseCss.ts` and `src/lib/ai/prompts/standards/classes.md`.
>
> **Scope.** The system describes the *vocabulary* (`mgf-*` classes + `--mgf-*` tokens), the *layering* (how those combine into archetypes), and the *contract* (what an AI / generator may emit and what it must never emit). It does not describe the editor UI itself — that is a separate design system living in `src/features/editor/`.

---

## 1. Mental model

Three layers, in cascade order. **Tokens** define what a project *looks like* (its brand). **Classes** define what a component *does* (its structure). **Modifier classes** retune a component's style without changing its structure. Generators emit classes; the framework resolves them through tokens.

```
┌──────────────────────────────────────────────────────────┐
│  Tokens  :root { --mgf-color-accent: #22D3EE; … }        │  ← Brand. Per-project.
├──────────────────────────────────────────────────────────┤
│  Classes  .mgf-card, .mgf-stat-group, .mgf-chart-bar …  │  ← Vocabulary. Cross-project.
        ↑ each rule reads tokens via var(--mgf-*, fallback)
├──────────────────────────────────────────────────────────┤
│  Modifiers  .mgf-glass, .mgf-neo, .mgf-grain, …          │  ← Cosmetic accent. Compose freely.
└──────────────────────────────────────────────────────────┘
```

A generator never emits token rules. It emits `<div class="mgf-card mgf-glass mgf-grain">…</div>` and the framework picks up the project's tokens automatically.

---

## 2. The token contract

Every visual decision flows from a `--mgf-*` CSS variable. A project defines them in `style.css`; the editor's `useAssemblePreview` injects them before any class rule runs. If a token is undefined, every class falls back to a sensible default.

### 2.1 Required tokens

These should be defined by every project. They appear in every archetype.

| Token                                | Purpose                       | Fallback            |
| ------------------------------------ | ----------------------------- | ------------------- |
| `--mgf-color-bg`                     | Page background               | `#0b0f17`           |
| `--mgf-color-surface`                | Card / widget surface         | `#0f1218`           |
| `--mgf-color-surface-2`              | Recessed / secondary surface  | `#1A2238`           |
| `--mgf-color-border`                 | Hairlines, dividers, card borders | `rgba(255,255,255,0.08)` |
| `--mgf-color-text-primary`           | Body text                     | `#f4f6fa`           |
| `--mgf-color-text-secondary`         | Muted text                    | `#94a3b8`           |
| `--mgf-color-text-inverse`           | Text on accent backgrounds    | `#0A0E1A`           |
| `--mgf-color-accent`                 | Primary accent (links, dots, chart bars) | `#22D3EE` |
| `--mgf-color-accent-2`               | Secondary accent              | `#fbbf24`           |
| `--mgf-color-accent-soft`            | Soft tint for accent bands    | `rgba(34,211,238,0.08)` |
| `--mgf-font-body`                    | Body font stack               | `system-ui, sans-serif` |
| `--mgf-font-display`                 | Headlines, large numerals     | `system-ui, sans-serif` |
| `--mgf-font-mono`                    | Code, monospace               | `ui-monospace, monospace` |
| `--mgf-font-serif`                   | Optional serif                | `Georgia, serif`    |

### 2.2 Sized tokens

Optional but recommended. When defined, they retune the entire
system to the project's scale. When undefined, classes use literal
rem values.

| Token                                 | Fallback        |
| ------------------------------------- | --------------- |
| `--mgf-space-2` / `-3` / `-4` / `-6` / `-8` / `-12` / `-16` / `-24` | `0.5rem` / `0.75rem` / `1rem` / `1.5rem` / `2rem` / `3rem` / `4rem` / `6rem` |
| `--mgf-radius-sm` / `-md` / `-lg`     | `4px` / `10px` / `12px` |
| `--mgf-text-xs` / `-sm` / `-base` / `-lg` / `-2xl` / `-3xl` / `-4xl` | `0.8125rem` / `0.9375rem` / `1.0625rem` / `1.25rem` / `2.5rem` / `3.5rem` / `5rem` |
| `--mgf-weight-medium` / `-bold`      | `500` / `700` |
| `--mgf-leading-tight` / `-normal`     | `1.15` / `1.5`  |
| `--mgf-tracking-tight` / `-wide`      | `-0.03em` / `0.08em` |
| `--mgf-shadow-sm` / `-md` / `-lg`     | small / medium / large rgba shadows |

### 2.3 Theme overrides via tokens

The whole system is theme-switchable by overriding tokens at the
component, slide, or `data-theme` scope:

```html
<section class="mgf-slide" style="--mgf-color-accent: #ff7a59; --mgf-color-bg: #fff7f0;">
  …
</section>
```

Or globally:

```css
[data-theme="warm"] {
  --mgf-color-accent: #ff7a59;
  --mgf-color-bg: #fff7f0;
  --mgf-color-text-primary: #2a1810;
  --mgf-color-surface: #ffffff;
  --mgf-color-border: rgba(0,0,0,0.08);
}
```

---

## 3. The class contract

A class is in the vocabulary when it appears in
[`src/lib/ai/prompts/standards/classes.md`](../src/lib/ai/prompts/standards/classes.md).
A generator **must not** invent new class names. If a needed primitive
isn't in the vocabulary, propose it in the spec and add it to the
source of truth first.

### 3.1 The hard rules

1. **Every visible element has a `mgf-*` class.** No raw `<div>` with
   inline-only styling for things users will see.
2. **One class per role per concern.** A card is `.mgf-card`. A card
   with glassmorphism is `.mgf-card.mgf-glass` — never
   `.mgf-glass-card`.
3. **Tune via tokens, not hex codes.** No `style="color: #22D3EE"`.
   Use `style="color: var(--mgf-color-accent)"` or, better, apply
   `.mgf-text-accent`.
4. **Numbers / dimensions come from tokens.** No `style="padding:
   2.5rem"`. Use `var(--mgf-space-6, 1.5rem)` or apply a utility
   class (`.mgf-pad-lg`).
5. **Don't reach into `.mgf-*` selectors from project CSS.** A
   project's `style.css` may only add `:root` tokens + the
   `.mgf-math-enabled` opt-in class. Anything else collides with the
   editor's cascade.

### 3.2 Naming grammar

```
mgf-<domain>[-<role>][-<variant>]

domain    : slide | card | stat | kpi | hero | section | nav | footer
         | cta | feature | team | table | faq | chart | step
         | comparison | timeline | callout | list | badge | tag
         | quote | testimonial | avatar | bento | marquee
         | spotlight | marks | code | media | icon | video | map
         | form | input | price | website | grain | glass | neo
         | bg | frame | deck | carousel | dashboard | dash | widget
         | infographic | hero | nav | footer | mono | display
role      : title | body | label | value | sub | icon | number | …
variant   : lg | xl | sm | accent | success | warning | muted | danger
         | accent | soft | grid | fine | inline | block
modifier  : glass | neo | brutal-border | grain | dense | air
         | hi | lo | flat | center | left | right | inverse
```

The `mgf-bg-*` family is exclusively for **background patterns** (grid,
dots, lines, gradient). Use `mgf-bg-accent` for a solid accent fill, not
`.mgf-bg-accent-fill`.

The `mgf-website-*` family is exclusively for the **website
archetype**. Decks must never emit it.

The `math-inline` and `math-block` classes are the **only non-prefixed
classes** in the vocabulary. They are passed through to KaTeX verbatim.

---

## 4. The four archetypes

Every project picks exactly one archetype at the `project.archetype`
field. The archetype determines which layout shape the preview renders
and which class families are legal.

### 4.1 `deck` — paginated presentation slides

```
<section class="mgf-slide">…</section>
<section class="mgf-slide">…</section>
…
```

- Each slide is a `<section class="mgf-slide">`. One per component
  file.
- Slides stack inside `<div class="mgf-deck">` (centered 960px column)
  or `.mgf-deck-vertical` (with gaps).
- Optional: `.mgf-deck-progress` (sticky bar at top),
  `.mgf-deck-dots` (page dots beneath).
- Slide sizes via `.mgf-slide-size-16x9` / `.mgf-slide-size-4x3` /
  `.mgf-slide-size-a4` / `.mgf-slide-size-square`.
- **Banned:** `.mgf-website-*`, `.mgf-nav`, `.mgf-footer` (use the
  website archetype for nav chrome).

### 4.2 `website` — long-scroll single-page site

```
<div class="mgf-website">
  <nav class="mgf-website-nav">…</nav>
  <section class="mgf-website-hero">…</section>
  <section class="mgf-website-section">…</section>
  …
  <footer class="mgf-website-footer">…</footer>
</div>
```

- Page chrome lives in `layout.html`; each `slide-NN.html` becomes a
  vertical section.
- All site-wide navigation belongs to `.mgf-website-*` classes.
- Each section is one of: `.mgf-website-hero`, `.mgf-website-section`,
  `.mgf-website-testimonial`, `.mgf-website-faq`, `.mgf-website-cta`.
- Inside a section, use the **deck vocabulary** (cards, grids, stats,
  features, pricing, FAQ rows) — the only `.mgf-website-*` classes
  are the section containers themselves.

### 4.3 `dashboard` — 12-column grid canvas

```
<div class="mgf-dashboard">
  <div class="mgf-dash-grid">
    <div class="mgf-dash-cell" style="--col: 8; --row: 2;">…</div>
    <div class="mgf-dash-card" style="--col: 4">…</div>
    …
  </div>
</div>
```

- `mgf-dash-cell` exposes two CSS variables: `--col` (1–12, default 4)
  and `--row` (default 1). Authors span cells by setting these inline.
- `mgf-widget` is a `.mgf-color-surface-2` panel for embedding inside
  a cell.
- `mgf-infographic` is a 12-column canvas (no automatic gaps) for
  posters / explainers. `mgf-infographic-flow` layers arrow
  connectors over children.

### 4.4 `carousel` — horizontal scroll

```
<div class="mgf-carousel">
  <div class="mgf-carousel-track">
    <div class="mgf-carousel-item">…</div>
    <div class="mgf-carousel-item">…</div>
  </div>
</div>
<div class="mgf-carousel-dots">…</div>
```

- Items are `min-width: 280px`; the track is `scroll-snap-type: x
  mandatory` so children snap-align automatically.

---

## 5. The component vocabulary

The component layer composes primitives into higher-level blocks.
Generators compose these from tokens + modifiers. Each component has
one canonical class and zero or more satellite classes for the inner
anatomy.

### 5.1 Cards

`.mgf-card` is the surface. `.mgf-card-accent` adds an accent border.
`.mgf-card-solid` removes the border. `.mgf-card-hover` lifts on
hover. `.mgf-card-glass` and `.mgf-card-neo` are modifier-driven
visual takes.

```html
<article class="mgf-card mgf-card-hover">
  <p class="mgf-card-label">Q3 ARR</p>
  <h3 class="mgf-card-value">$1.2M</h3>
  <p class="mgf-card-body">Up 32% QoQ</p>
  <footer class="mgf-card-footer">Updated 3 days ago</footer>
</article>
```

### 5.2 Stats

`.mgf-stat-group` is a 4-up grid (collapses to 2 at 900px, 1 at 600px).
Inside: `.mgf-stat-value` + `.mgf-stat-label` (+ `.mgf-stat-sub`). Use
`.mgf-stat-value-lg` for hero-scale (clamp 2.5–4rem). Compact KPI: use
`.mgf-kpi` instead.

### 5.3 Testimonials

`.mgf-testimonial` centers one. `.mgf-testimonial-grid` lays them out.
`.mgf-quote-mark` + `.mgf-quote-text` + `.mgf-quote-author`
(`-name`/`-title`/`-avatar`). For a left-aligned pull quote, use
`.mgf-quote` (with `border-inline-start` accent stripe).

### 5.4 Code

Inline: `.mgf-code`. Block: `.mgf-code-card` with
`.mgf-code-card-header` (title + dots), `.mgf-code-card-body`. Token
highlight classes `.mgf-code-keyword` / `.mgf-code-string` /
`.mgf-code-comment` / `.mgf-code-fn` are applied by the code block
post-processor, not by the AI.

### 5.5 Hero / section / divider

`.mgf-hero` is the flexible hero block. `.mgf-section` is the
generic section. `.mgf-divider` is a hairline; `.mgf-divider-short`
is the 60px accent rule. `.mgf-accent-bar` / `.mgf-accent-bar-lg` is
the small accent underline under titles.

### 5.6 Chapter number

`.mgf-chapter-num` (32px) or `.mgf-chapter-num-lg` (64px) — a circle
filled with `--mgf-color-accent`. Legacy alias `.mgf-chapter-number`
still works.

### 5.7 Feature / team / table / FAQ / pricing / media

All follow the same pattern: container class + anatomy classes inside.

```
.mgf-feature:    icon, title, desc
.mgf-team-grid:  member (name, role, bio)
.mgf-table:      th, td (standard <table>)
.mgf-faq:        faq-item (faq-q, faq-a)
.mgf-price:      value, period
.mgf-media:      (image goes inside)
```

### 5.8 Timeline / steps / comparison

`.mgf-timeline` is a vertical axis with `.mgf-timeline-dot` per item.
`.mgf-steps` is a horizontal flow with `.mgf-step-num` per step.
`.mgf-comparison` is a two-column grid.

### 5.9 Bento / marquee / spotlight / marks

Bento: `.mgf-bento` (12-col) with `.mgf-bento-item` (span via
`--span`). Marquee: `.mgf-marquee` viewport, `.mgf-marquee-track`
inner, `.mgf-marquee-item`. Spotlight: `.mgf-spotlight` (radial
accent glow). Marks: `.mgf-marks` grid + `.mgf-mark` cell.

---

## 6. The chart system (CSS-only)

Charts are zero-JS for every type that can be CSS-only. The
author sets inline custom properties; the class reads them.

### 6.1 Bar (vertical)

```html
<div class="mgf-chart">
  <h4 class="mgf-chart-title">Quarterly revenue</h4>
  <div class="mgf-chart-bar">
    <div>
      <div class="mgf-bar-value">$240k</div>
      <div class="mgf-bar" style="--val: 80%"></div>
      <div class="mgf-bar-label">Q1</div>
    </div>
    …
  </div>
</div>
```

`--val` is 0–100% of the bar's filled portion.

### 6.2 Bar (stacked)

```html
<div class="mgf-chart-stacked">
  <div class="mgf-bar-stack" style="--val: 60%">
    <div class="mgf-seg mgf-seg-1" style="--seg: 3"></div>
    <div class="mgf-seg mgf-seg-2" style="--seg: 1"></div>
  </div>
</div>
```

`--seg` is the relative flex weight of each segment inside the stack.
Default segment colors: accent / amber / green / purple. Override per
segment by inlining `background:`.

### 6.3 Bar (horizontal)

```html
<div class="mgf-chart-hbar">
  <span class="mgf-hbar-label">North region</span>
  <div class="mgf-hbar" style="--val: 70%"></div>
</div>
```

### 6.4 Pie / donut

```html
<div class="mgf-chart-pie mgf-chart-donut"
     style="--slices: conic-gradient(
       #22D3EE 0% 35%,
       #fbbf24 35% 60%,
       #4ade80 60% 100%)">
  <div class="mgf-pie-center">$1.2M</div>
</div>
```

`--slices` is a CSS `conic-gradient` string. Drop `mgf-chart-donut` to
remove the hollow center.

### 6.5 Heatmap

```html
<div class="mgf-heatmap" style="--cols: 7">
  <div class="mgf-heat-cell" style="--heat: 0.1"></div>
  <div class="mgf-heat-cell" style="--heat: 0.4"></div>
  …
</div>
```

`--cols` is column count (default 7). `--heat` is 0..1; the cell color
is `color-mix(--mgf-color-accent, --mgf-color-surface-2)`.

### 6.6 SVG charts (line, area, gauge, radar)

Hand-author the SVG. The classes style stroke / fill against
`--mgf-color-accent`:

- `.mgf-sparkline path` — thin accent stroke.
- `.mgf-line path` — accent stroke; `.mgf-line .mgf-area-fill` — 20%
  accent fill below the line.
- `.mgf-area path` — 30% accent fill (no stroke).
- `.mgf-gauge .mgf-gauge-needle` — white stroke for the needle.
- `.mgf-radar .mgf-radar-grid` — border-tint gridlines;
  `.mgf-radar .mgf-radar-shape` — accent stroke + 30% accent fill.
- `.mgf-axis-label` — small text label (uses `fill`, not `color`).

`.mgf-axis-label` is the **only chart class that should appear on
`<text>` elements inside the SVG**.

### 6.7 Chart legend

```html
<div class="mgf-chart-legend">
  <span class="mgf-legend-item" style="--legend: #22D3EE">Revenue</span>
  <span class="mgf-legend-item" style="--legend: #fbbf24">Costs</span>
</div>
```

---

## 7. Backgrounds + frames

### 7.1 Patterns

| Class                    | What it draws                       |
| ------------------------ | ----------------------------------- |
| `mgf-bg-grid`            | 32px subtle grid                    |
| `mgf-bg-grid-fine`       | 16px subtle grid                    |
| `mgf-bg-grid-lg`         | 64px subtle grid                    |
| `mgf-bg-dots`            | 24px dot grid                       |
| `mgf-bg-lines`           | 14px diagonal stripes               |
| `mgf-bg-gradient`        | Vertical surface → bg gradient      |
| `mgf-bg-gradient-accent` | 135° accent → transparent gradient  |
| `mgf-bg-surface`         | Solid surface                       |
| `mgf-bg-accent`          | Solid accent (inverse text)         |
| `mgf-bg-accent-soft`     | Soft accent tint                    |

Patterns use `color-mix(in srgb, var(--mgf-color-text-primary, #f4f6fa) 6%, transparent)` for their foreground, so they read on light AND dark themes automatically.

### 7.2 Frames

`.mgf-frame` adds a 1px inset border around an element. `.mgf-frame-accent` makes it 2px and accent-colored. `.mgf-frame-double` adds a second inner border 6px in. All frames are `pointer-events: none`.

---

## 8. Modifiers

Modifiers retune an existing component without changing its
structure. They compose:

```html
<div class="mgf-card mgf-glass mgf-grain">…</div>
<button class="mgf-cta-solid mgf-hi">…</button>
<section class="mgf-hero mgf-ambient-glow">…</section>
```

The full modifier list:

| Modifier           | What it changes                                    |
| ------------------ | -------------------------------------------------- |
| `mgf-glass`        | Translucent fill + backdrop-blur                    |
| `mgf-neo`          | Solid fill + 4px offset shadow                      |
| `mgf-neo-inset`    | Inset shadow (pressed)                              |
| `mgf-brutal-border` | 3px border + 6px offset shadow                    |
| `mgf-grain`        | Noise overlay (feTurbulence SVG)                   |
| `mgf-grain-heavy` / `-soft` / `-none` | Grain intensity           |
| `mgf-ambient-glow` | Soft accent radial glow behind the element          |
| `mgf-dense`        | Tighten spacing (override `--mgf-space-*`)          |
| `mgf-air`          | Loosen spacing                                       |
| `mgf-hi`           | Higher contrast + saturation (filter)               |
| `mgf-lo`           | Lower contrast + saturation                         |
| `mgf-flat`         | Strip shadow / filter (undo a parent modifier)      |
| `mgf-display-serif` / `-mono`     | Display font swap                 |
| `mgf-body-serif` / `-mono`        | Body font swap                     |
| `mgf-accent-1` / `-2`             | Text color: primary / secondary accent |

Modifiers never redefine layout. They are pure cosmetic accents.

---

## 9. Layout utilities

The vocabulary has a minimal set of utility classes for spacing and
flex:

- `.mgf-pad-sm` / `-md` / `-lg` — padding from `--mgf-space-2` / `-4` / `-6`
- `.mgf-mt-sm` / `-md` / `-lg` — margin-top from same scale
- `.mgf-mb-sm` / `-md` / `-lg` — margin-bottom
- `.mgf-gap-sm` / `-md` / `-lg` — flex/grid gap
- `.mgf-flex` / `-col` / `-center` / `-between` / `-start` / `-wrap`

For finer control, use inline `style="gap: var(--mgf-space-4, 1rem)"`. Never inline `style="gap: 1rem"` (no token).

### 9.1 Text alignment

`.mgf-text-center` / `-left` / `-right`. For RTL, prefer
`.mgf-text-start` / `-end` (logical) — added in 2026-08-17.

---

## 10. Responsive collapse

The system collapses in three steps:

1. **≥ 900px**: every grid is at its declared size (`.mgf-grid-3` is
   3-up, `.mgf-grid-4` is 4-up, `.mgf-stat-group` is 4-up).
2. **600–899px**: `.mgf-stat-group` collapses to 2-up;
   `.mgf-comparison` collapses to 1-up.
3. **< 600px**: every grid (`.mgf-grid-3`, `.mgf-grid-4`,
   `.mgf-stat-group`) collapses to single column. `.mgf-bento`
   collapses to single column and every `.mgf-bento-item` loses its
   custom `--span`.

The width tokens (`--mgf-text-*`, `--mgf-leading-*`, `--mgf-tracking-*`)
are not modified by media queries. The composition of `clamp(…)`
calls in `.mgf-title-xl` and `.mgf-website-hero-title` handle fluid
scaling above the breakpoint collapse.

---

## 11. RTL handling

Most of the system uses logical properties
(`padding-inline`, `border-inline-start`, `inset-inline-start`)
and mirrors for free under `[dir="rtl"]`.

A handful of rules still use physical `left` / `right` and need
explicit overrides. The block at the bottom of `baseCss.ts`
documents each one:

```css
[dir="rtl"] .mgf-list li          { padding-left: 0; padding-right: var(--mgf-space-4, 1rem); }
[dir="rtl"] .mgf-list li::before  { left: auto; right: 0; }
[dir="rtl"] .mgf-website-nav      { flex-direction: row-reverse; }
[dir="rtl"] .mgf-marquee-track    { animation-direction: reverse; }
[dir="rtl"] .mgf-marquee-track > * { direction: ltr; }
[dir="rtl"] .mgf-hbar             { transform-origin: right; }
```

When you add a new rule that uses physical properties, also add its
RTL counterpart to this block. RTL projects (`<html dir="rtl">`) also
get Google Fonts (Cairo + Tajawal) injected automatically — see
`src/features/editor/utils/arabicFont.ts`.

---

## 12. Math (KaTeX)

Math content is **opt-in**: the editor scans the rendered body for
`.math-inline` / `.math-block` and only then loads KaTeX's CSS + JS
(see `src/features/editor/utils/mathRender.ts`). Body gets two
cooperating classes when math is detected:

- `mgf-math-enabled` — scopes the theme-aware KaTeX recolor rules
  (so KaTeX's hardcoded colors track `--mgf-color-text-primary` and
  `--mgf-color-accent`).
- `mgf-math-root` — the wrapper KaTeX renders inside.

```html
<p>
  The formula <span class="math-inline" data-tex="E=mc^2"></span> is …
</p>
<div class="math-block" data-tex="\int_0^1 x^2 \,dx = \frac{1}{3}"></div>
```

The `data-tex` attribute is a literal LaTeX string passed verbatim to
KaTeX. Do not use Markdown or KaTeX's `\displaystyle` flag in inline
math — it inherits from the renderer.

---

## 13. The AI / generator contract

This is the section your backend agent reads most carefully. The
generator's job is to emit HTML + a style.css (tokens only) + a
content.json (data placeholders). The editor's `useAssemblePreview`
assembles everything into a previewable document.

### 13.1 What a generator MAY emit

- `<html>` body content using `mgf-*` classes.
- Inline `style="…"` for `var(--mgf-*, fallback)` references only.
- Inline `style="…"` for chart variables (`--val`, `--seg`, `--slices`,
  `--heat`, `--cols`, `--legend`, `--span`, `--col`, `--row`).
- Inline `style="…"` for theme overrides (e.g.
  `--mgf-color-accent: #ff7a59` on a single slide).
- `<svg>` for line / area / gauge / radar / sparkline charts.
- `<span class="math-inline" data-tex="…">` and
  `<div class="math-block" data-tex="…">` for formulas.

### 13.2 What a generator MUST emit

- A `style.css` that defines `:root` tokens for at least the
  required set (see §2.1). Tokens override defaults; missing tokens
  fall back to the framework defaults.
- A `content.json` whose keys match the placeholders the generator
  used (`{{title}}`, `{{subtitle}}`, etc.). Placeholders are resolved
  at preview time by `replaceContentPlaceholders` in
  `src/features/editor/hooks/useAssemblePreview.ts`.
- For `website` archetype: a `layout.html` that contains `{{slides}}`
  and the chrome (`.mgf-website-nav`, `.mgf-website-footer`).

### 13.3 What a generator MUST NEVER emit

- New class names not in the vocabulary. (If you need one, add it to
  `classes.md` and `baseCss.ts` first.)
- Inline `style="color: #…"` / `style="padding: 1rem"` / etc.
  without a `var(--mgf-*, fallback)`.
- `<style>` blocks. Tokens belong in `style.css` (one per project),
  not inline.
- Hardcoded colors in SVG. Use `currentColor` or
  `var(--mgf-color-accent)` so the chart picks up the theme.
- `.mgf-website-*` classes in deck / dashboard / carousel archetypes.
- `.mgf-deck-*` / `.mgf-dash-*` / `.mgf-carousel-*` classes in website
  archetype (use `.mgf-website-*` instead).
- Anything that mutates a token globally except via `:root` in
  `style.css`.

### 13.4 The autocomplete mental model

When deciding which class to use:

1. **What's the role?** Card / stat / hero / section / chart / etc.
2. **What's the archetype?** deck / website / dashboard / carousel.
3. **What's the cosmetic accent?** Glass / neo / grain / flat / etc.
5. **Apply the modifier as a sibling class** (`.mgf-card mgf-glass`).
6. **If the role isn't in the vocabulary, don't emit.** Surface it
   back as a missing primitive and add it to the spec.

---

## 14. Worked examples for seed generators

### 14.1 Cover slide

```html
<section class="mgf-slide mgf-bg-gradient-accent">
  <span class="mgf-chapter-num">01</span>
  <p class="mgf-eyebrow">Series A — Q3 2026</p>
  <h1 class="mgf-title-xl">{{title}}</h1>
  <p class="mgf-subtitle">{{subtitle}}</p>
  <div class="mgf-hero-ctas">
    <a class="mgf-cta-solid mgf-cta-lg">{{primary_cta}}</a>
    <a class="mgf-cta">{{secondary_cta}}</a>
  </div>
</section>
```

### 14.2 Stats slide

```html
<section class="mgf-slide">
  <p class="mgf-label">By the numbers</p>
  <h2 class="mgf-title-lg">{{section_title}}</h2>
  <div class="mgf-stat-group">
    <div class="mgf-stat">
      <p class="mgf-stat-value">{{kpi_1_value}}</p>
      <p class="mgf-stat-label">{{kpi_1_label}}</p>
    </div>
    …
  </div>
</section>
```

### 14.3 Chart slide (pie + horizontal bars)

```html
<section class="mgf-slide mgf-grid-2">
  <div>
    <h3 class="mgf-title">{{chart_title}}</h3>
    <p class="mgf-body">{{chart_caption}}</p>
  </div>
  <div class="mgf-grid-2">
    <div class="mgf-chart-pie mgf-chart-donut"
         style="--slices: conic-gradient(
           #22D3EE 0% 45%,
           #fbbf24 45% 70%,
           #4ade80 70% 100%)">
      <div class="mgf-pie-center">{{total}}</div>
    </div>
    <div class="mgf-chart-hbar">
      <span class="mgf-hbar-label">{{hbar_1_label}}</span>
      <div class="mgf-hbar" style="--val: 70%"></div>
      …
    </div>
  </div>
</section>
```

### 14.4 Hero section (website archetype)

```html
<section class="mgf-website-hero">
  <p class="mgf-eyebrow">{{eyebrow}}</p>
  <h1 class="mgf-website-hero-title">{{title}}</h1>
  <p class="mgf-website-hero-sub">{{sub}}</p>
  <div class="mgf-website-hero-ctas">
    <a class="mgf-cta-solid mgf-cta-lg">{{primary_cta}}</a>
    <a class="mgf-cta">{{secondary_cta}}</a>
  </div>
</section>
```

### 14.5 Dashboard cell with KPI + chart

```html
<div class="mgf-dashboard">
  <div class="mgf-dash-grid">
    <div class="mgf-dash-card" style="--col: 4">
      <p class="mgf-kpi-label">Active users</p>
      <p class="mgf-kpi-value">{{users}}</p>
    </div>
    <div class="mgf-dash-cell" style="--col: 8; --row: 2">
      <h4 class="mgf-chart-title">{{chart_title}}</h4>
      <div class="mgf-chart-bar">
        <div><div class="mgf-bar" style="--val: 40%"></div></div>
        …
      </div>
    </div>
  </div>
</div>
```

---

## 15. Extension protocol

Adding a new class is cheap; adding a poorly-named class is forever.
Follow this protocol when the vocabulary can't express what you need:

1. **Spec first.** Write a short spec: name, role, default values,
   whether it's a modifier or a structural class, which archetype(s)
   it belongs to. Open a PR with the spec before writing CSS.
2. **Add to `baseCss.ts` in the right section.** Sections are
   numbered and labeled; respect the order.
3. **Add to `classes.md` in the matching table.** Mirror the
   "Naming grammar" so future readers find it.
4. **If the class takes a CSS variable** (`--val`, `--slices`, …),
   document it in the matching chart / grid cheatsheet.
5. **If the class uses physical properties, add an RTL override**
   in the RTL block at the bottom of `baseCss.ts`.
6. **Build + visually verify.** Render a seed project that uses the
   class, on both light and dark tokens, and on RTL if applicable.

Do not skip steps 1–2. The vocabulary is the contract.

---

## 16. Reference paths

| What                                     | Where                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| Class rules (framework)                  | `src/features/editor/lib/baseCss.ts`                                     |
| Class catalog (canonical)                | `src/lib/ai/prompts/standards/classes.md`                                |
| Prompt standards (other docs)            | `src/lib/ai/prompts/standards/` (website.md, math.md, etc.)              |
| Token assembly + placeholder substitution | `src/features/editor/hooks/useAssemblePreview.ts`                      |
| Math rendering                           | `src/features/editor/utils/mathRender.ts`                                |
| RTL font injection                       | `src/features/editor/utils/arabicFont.ts`                                |
| Archetype-specific recipes               | `src/lib/ai/prompts/standards/website.md`, `dashboard.md`, etc.          |
| Lab fixtures (reference material)        | `mgf_test_lab/fixtures/`, `mgf_test_lab/output/`, `mgf_test_lab/vocabulary/` |

---

## 17. Glossary

| Term             | Meaning                                                                 |
| ---------------- | ----------------------------------------------------------------------- |
| **Archetype**    | The top-level layout shape of a project: deck, website, dashboard, carousel. |
| **Token**        | A `--mgf-*` CSS variable defining a brand value (color, size, font).    |
| **Class**        | A `mgf-*` CSS class implementing a structural or component primitive.  |
| **Modifier**     | A `mgf-*` class that retunes an existing element cosmetically.         |
| **Domain**       | The first segment of a class name (`mgf-<domain>-<role>`).             |
| **Compose**      | Putting two `mgf-*` classes on the same element (`.mgf-card mgf-glass`). |
| **Cascade order**| `:root` tokens → framework `.mgf-*` classes → project `style.css` → `layout.css` → `slide.css` → inline styles. |
| **Scope**        | Where a class is allowed to appear (deck / website / all).             |