# Task: Generate the Style Layer

Generate the `style.css` for an MGF project. This file defines ALL
brand tokens as CSS custom properties under `:root`. Keep every
`--mgf-*` variable name identical to the contract — only the values
change.

## Input

Read the project's `context` for the brand voice, visual constraints,
and palette direction. Read `standards/tokens.md` for the full
variable list.

## Output

A JSON object whose only top-level key is `style.css`. The value is
the full CSS file contents (no markdown fences, no preamble).

## Required variables

The token names are part of the MGF protocol. The `:root` block must
declare every name in `standards/tokens.md`:

```css
:root {
  --mgf-color-bg:            /* page background */;
  --mgf-color-surface:       /* card / panel surface */;
  --mgf-color-surface-2:     /* raised surface */;
  --mgf-color-border:        /* subtle border */;
  --mgf-color-border-strong: /* emphasised border */;
  --mgf-color-text-primary:  /* main text */;
  --mgf-color-text-secondary:/* muted text */;
  --mgf-color-text-inverse:  /* text on accent */;
  --mgf-color-accent:        /* primary accent */;
  --mgf-color-accent-soft:   /* tinted accent */;
  --mgf-color-accent-2:      /* secondary accent */;

  --mgf-font-display: 'Inter', system-ui, sans-serif;
  --mgf-font-body:    'Inter', system-ui, sans-serif;
  --mgf-font-mono:    'JetBrains Mono', ui-monospace, monospace;

  --mgf-text-xs:   0.75rem;
  --mgf-text-sm:   0.875rem;
  --mgf-text-base: 1rem;
  --mgf-text-lg:   1.25rem;
  --mgf-text-xl:   1.75rem;
  --mgf-text-2xl:  2.5rem;
  --mgf-text-3xl:  3.5rem;
  --mgf-text-4xl:  5rem;

  --mgf-weight-normal: 400;
  --mgf-weight-medium: 500;
  --mgf-weight-bold:   700;

  --mgf-leading-tight:  1.15;
  --mgf-leading-normal: 1.5;
  --mgf-leading-loose:  1.75;

  --mgf-tracking-tight:  -0.03em;
  --mgf-tracking-normal:  0em;
  --mgf-tracking-wide:    0.08em;

  --mgf-space-1:  0.25rem;
  --mgf-space-2:  0.5rem;
  --mgf-space-3:  0.75rem;
  --mgf-space-4:  1rem;
  --mgf-space-6:  1.5rem;
  --mgf-space-8:  2rem;
  --mgf-space-12: 3rem;
  --mgf-space-16: 4rem;
  --mgf-space-24: 6rem;

  --mgf-radius-sm: 4px;
  --mgf-radius-md: 8px;
  --mgf-radius-lg: 16px;
  --mgf-radius-xl: 24px;

  --mgf-slide-w:    1280px;
  --mgf-slide-h:    720px;
  --mgf-slide-pad-x: 80px;
  --mgf-slide-pad-y: 60px;

  --mgf-accent-line: 3px solid var(--mgf-color-accent);
  --mgf-divider:     1px solid var(--mgf-color-border);
}
```

## Rules

- Every variable must have a value — do not leave any undefined.
- Colors must pass WCAG AA contrast (4.5:1 for normal text, 3:1 for large text).
- `font-display` and `font-body` may be the same or different.
- Slide dimensions should match the target format (1280×720 for 16:9, 1080×1080 for 1:1, etc.).
- `accent-2` should be a secondary accent (success / warning / etc.).
- `text-inverse` must work on `accent` and `accent-2` backgrounds.
- Output ONLY the CSS. No markdown fences. No preamble.
