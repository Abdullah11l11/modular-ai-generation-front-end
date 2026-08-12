# Website Vocabulary

The website archetype is a long-scroll, single-page site. Each
`slide-NN.html` is a section in the page rather than a viewport in
a deck. The renderer concatenates all slides into the `{{slides}}`
slot inside `layout.html`, which provides the page chrome (top nav +
footer) and a single `<main>` container.

## When to use

| Use when… | Don't use when… |
| --------- | --------------- |
| Brief asks for a landing page, marketing site, or product page. | The brief is a deck to present live (use `presentation` archetype). |
| Output should scroll naturally on desktop and mobile. | Each section needs its own keyboard navigation (use `presentation`). |
| Sections stack into one CTA-driven narrative. | Output is a multi-page site with separate routes (out of scope for MGF). |

## Layout wrapper

`layout.html` carries the page chrome and the `<main>` slot for slides:

```html
<div class="mgf-website">
  <header class="mgf-website-nav">
    <a class="mgf-website-brand" href="#top" data-field="brand">{{title}}</a>
    <nav class="mgf-website-links">
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a href="#faq">FAQ</a>
      <a class="mgf-cta-solid" href="#cta" data-field="nav_cta">Get started</a>
    </nav>
  </header>
  <main id="top">{{slides}}</main>
  <footer class="mgf-website-footer">
    <p class="mgf-caption" data-field="footer">© 2026 {{title}}</p>
  </footer>
</div>
```

The renderer (`useAssemblePreview.ts`) substitutes `{{slides}}` with
the concatenation of every `slide-NN.html`. Tokens like `{{title}}`
and `{{brand}}` resolve from top-level scalars in `data.json`.

## Section classes

These classes appear in section HTML. None of them replace the
shared `mgf-*` vocabulary — they only organize full-width bands.

| Class | Purpose |
| ----- | ------- |
| `mgf-website` | Root page wrapper. |
| `mgf-website-nav` | Top navigation bar. |
| `mgf-website-brand` | Brand link in the nav (left side). |
| `mgf-website-links` | Right-side nav links container. |
| `mgf-website-footer` | Bottom-of-page footer band. |
| `mgf-website-hero` | First section, full-width hero band. |
| `mgf-website-hero-title` | Hero headline (oversized type). |
| `mgf-website-hero-sub` | Hero subheadline. |
| `mgf-website-hero-ctas` | Container for hero primary + secondary CTAs. |
| `mgf-website-section` | Every other section band. |
| `mgf-website-section-header` | Section eyebrow + title + sub container. |
| `mgf-website-section-title` | Section H2 (large but not hero-sized). |
| `mgf-website-section-sub` | Section subtitle / framing line. |
| `mgf-website-testimonial` | Centered testimonial container. |
| `mgf-website-faq` | Narrow centered FAQ column. |
| `mgf-website-cta` | Closing CTA band container. |
| `mgf-website-cta-title` | Closing CTA headline. |
| `mgf-website-cta-body` | Closing CTA supporting body. |
| `mgf-cta-lg` | Larger-size CTA button (hero / closing CTA only). |

## Section recipes

A section is a `<section class="mgf-website-section">` with an
`mgf-website-section-header` (eyebrow + title + optional sub) and
one or more content blocks (grids, cards, lists). Skip the header if
the section is self-evident.

### Hero

```html
<section class="mgf-website-hero" id="hero">
  <p class="mgf-eyebrow" data-field="eyebrow">Now in public beta</p>
  <h1 class="mgf-website-hero-title" data-field="title">Ship Faster. Sleep More.</h1>
  <p class="mgf-website-hero-sub" data-field="subtitle">One line of context, max 24 words.</p>
  <div class="mgf-website-hero-ctas">
    <a class="mgf-cta-solid mgf-cta-lg" href="#" data-field="primary_cta_url" data-label-field="primary_cta">Primary CTA</a>
    <a class="mgf-cta" href="#" data-field="secondary_cta_url" data-label-field="secondary_cta">Secondary link →</a>
  </div>
</section>
```

### Features grid (4-up)

```html
<section class="mgf-website-section" id="features">
  <header class="mgf-website-section-header">
    <p class="mgf-eyebrow">Features</p>
    <h2 class="mgf-website-section-title" data-field="title">Everything you need</h2>
    <p class="mgf-website-section-sub" data-field="subtitle">One line of framing.</p>
  </header>
  <div class="mgf-grid-4" data-field="features">
    <div class="mgf-card"><!-- pillar --></div>
    <!-- 4 total -->
  </div>
</section>
```

### Stats band (tinted)

```html
<section class="mgf-website-section mgf-bg-accent-soft" id="stats">
  <header class="mgf-website-section-header">
    <p class="mgf-eyebrow">By the numbers</p>
    <h2 class="mgf-website-section-title" data-field="title">Proof points</h2>
  </header>
  <div class="mgf-stat-group" data-field="stats">
    <div class="mgf-card-accent"><!-- stat --></div>
    <!-- 4 total -->
  </div>
  <p class="mgf-caption mgf-text-center mgf-mt-md" data-field="caption">All figures as of Q2 2026.</p>
</section>
```

### Pricing (3-tier)

```html
<section class="mgf-website-section" id="pricing">
  <header class="mgf-website-section-header">
    <p class="mgf-eyebrow">Pricing</p>
    <h2 class="mgf-website-section-title" data-field="title">Plans</h2>
  </header>
  <div class="mgf-grid-3" data-field="plans">
    <div class="mgf-card"><!-- plan --></div>
    <div class="mgf-card mgf-card-accent"><!-- featured --></div>
    <div class="mgf-card"><!-- plan --></div>
  </div>
</section>
```

The middle plan should always carry `mgf-card-accent` so the
"recommended" tier visually pops.

### FAQ

```html
<section class="mgf-website-section" id="faq">
  <header class="mgf-website-section-header">
    <p class="mgf-eyebrow">FAQ</p>
    <h2 class="mgf-website-section-title" data-field="title">Frequently asked</h2>
  </header>
  <div class="mgf-website-faq" data-field="items">
    <div class="mgf-faq-item"><!-- q + a --></div>
    <!-- 4–6 total -->
  </div>
</section>
```

### Closing CTA

```html
<section class="mgf-website-section mgf-bg-accent-soft" id="cta">
  <div class="mgf-website-cta">
    <p class="mgf-eyebrow" data-field="eyebrow">Ready when you are</p>
    <h2 class="mgf-website-cta-title" data-field="title">Stop juggling tools.</h2>
    <p class="mgf-website-cta-body" data-field="body">One short paragraph framing the offer.</p>
    <a class="mgf-cta-solid mgf-cta-lg mgf-mt-lg" href="#" data-field="cta_url" data-label-field="cta">Primary CTA</a>
  </div>
</section>
```

### Contact

```html
<section class="mgf-website-section" id="contact">
  <header class="mgf-website-section-header">
    <p class="mgf-eyebrow">Contact</p>
    <h2 class="mgf-website-section-title" data-field="title">Talk to us</h2>
    <p class="mgf-website-section-sub" data-field="subtitle">Email, call, or book a walkthrough.</p>
  </header>
  <div class="mgf-grid-3 mgf-mt-lg">
    <div class="mgf-card mgf-text-center">
      <p class="mgf-card-label">Email</p>
      <p class="mgf-body mgf-mt-sm" data-field="email">hello@acme.io</p>
    </div>
    <!-- repeat for phone, address -->
  </div>
</section>
```

## Rules

1. **Sections are full-width bands, not 16:9 slides.** Never use
   `mgf-slide` or `mgf-slide-number` — the website archetype doesn't
   have either.
2. **Section IDs are anchor targets.** The nav links to
   `#features`, `#pricing`, `#faq`, `#cta`, `#contact`. Always set
   `id` on each section so the nav works.
3. **One CTA per section, max.** The hero gets two (primary + secondary).
   Every other section gets one CTA or none.
4. **Output target = `website`.** Set `_meta.output_target = 'website'`
   in `data.json`. The project type should be `website`.
5. **Use `layout.html`, not `layout.css`.** The website archetype
   substitutes `{{slides}}` into an HTML wrapper, not into CSS.
6. **Top-level scalars resolve `{{tokens}}` in layout.html.** Fields
   like `title`, `brand`, `nav_cta`, `footer` should appear at the
   top level of `data.json` (alongside `_meta` and `slides`) so the
   renderer can substitute them.
7. **No `mgf-slide-number`.** Scrollable pages don't have a 1-of-N
   counter.