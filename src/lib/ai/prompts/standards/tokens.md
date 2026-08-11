# Design Tokens

Every MGF project must declare the full token set in `style.css` under
`:root`. Tokens are the **only** place colors, fonts, and spacing
ratios live. Components never hardcode values.

## Names are contracts

The token names here are part of the MGF protocol. The AI must use
exactly these names. Renaming a token (e.g. `--mgf-color-bg` →
`--mgf-bg-primary`) breaks downstream consumers (the `Theme` properties
panel, the demo renderer, the seeders).

## Colors

```css
:root {
  --mgf-color-bg:            /* page background */;
  --mgf-color-surface:       /* card / panel surface */;
  --mgf-color-surface-2:     /* raised surface (modals, sticky bars) */;
  --mgf-color-border:        /* subtle border */;
  --mgf-color-border-strong: /* emphasised border */;
  --mgf-color-text-primary:  /* main text */;
  --mgf-color-text-secondary:/* muted text */;
  --mgf-color-text-inverse:  /* text on accent surfaces */;
  --mgf-color-accent:        /* primary accent (CTA, focus) */;
  --mgf-color-accent-soft:   /* tinted accent background */;
  --mgf-color-accent-2:      /* secondary accent (success / warning) */;
}
```

All text/background pairings must pass WCAG AA contrast:

- Normal text: 4.5:1 against its background.
- Large text (≥18pt regular or ≥14pt bold): 3:1.

`--mgf-color-text-inverse` must work on `--mgf-color-accent` and
`--mgf-color-accent-2` backgrounds.

## Typography

```css
:root {
  --mgf-font-display: 'Inter', system-ui, sans-serif;
  --mgf-font-body:    'Inter', system-ui, sans-serif;
  --mgf-font-mono:    'JetBrains Mono', ui-monospace, monospace;

  --mgf-text-xs:   0.75rem;   /* 12px */
  --mgf-text-sm:   0.875rem;  /* 14px */
  --mgf-text-base: 1rem;      /* 16px */
  --mgf-text-lg:   1.25rem;   /* 20px */
  --mgf-text-xl:   1.75rem;   /* 28px */
  --mgf-text-2xl:  2.5rem;    /* 40px */
  --mgf-text-3xl:  3.5rem;    /* 56px */
  --mgf-text-4xl:  5rem;      /* 80px */

  --mgf-weight-normal: 400;
  --mgf-weight-medium: 500;
  --mgf-weight-bold:   700;

  --mgf-leading-tight:  1.15;
  --mgf-leading-normal: 1.5;
  --mgf-leading-loose:  1.75;

  --mgf-tracking-tight:  -0.03em;
  --mgf-tracking-normal:  0em;
  --mgf-tracking-wide:    0.08em;
}
```

## Spacing

```css
:root {
  --mgf-space-1:  0.25rem;  /* 4px */
  --mgf-space-2:  0.5rem;   /* 8px */
  --mgf-space-3:  0.75rem;  /* 12px */
  --mgf-space-4:  1rem;     /* 16px */
  --mgf-space-6:  1.5rem;   /* 24px */
  --mgf-space-8:  2rem;     /* 32px */
  --mgf-space-12: 3rem;     /* 48px */
  --mgf-space-16: 4rem;     /* 64px */
  --mgf-space-24: 6rem;     /* 96px */
}
```

## Shape

```css
:root {
  --mgf-radius-sm: 4px;
  --mgf-radius-md: 8px;
  --mgf-radius-lg: 16px;
  --mgf-radius-xl: 24px;
}
```

## Slide canvas

```css
:root {
  --mgf-slide-w:    1280px;  /* 16:9 default */
  --mgf-slide-h:    720px;
  --mgf-slide-pad-x: 80px;
  --mgf-slide-pad-y: 60px;
}
```

Common format presets (the `layout` task prompt picks one):

| Format | Dimensions  | pad-x | pad-y |
| ------ | ----------- | ----- | ----- |
| 16:9   | 1280 × 720  | 80px  | 60px  |
| 1:1    | 1080 × 1080 | 64px  | 64px  |
| 9:16   | 1080 × 1920 | 48px  | 80px  |
| 4:3    | 1440 × 1080 | 80px  | 60px  |

## Decorative

```css
:root {
  --mgf-accent-line: 3px solid var(--mgf-color-accent);
  --mgf-divider:     1px solid var(--mgf-color-border);
}
```
