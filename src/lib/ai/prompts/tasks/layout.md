# Task: Generate the Layout Layer

Generate the `layout.css` for an MGF project. This file defines how
every `mgf-*` class behaves for the target output format. Keep all
class names identical to the standard vocabulary — only change the
rules (dimensions, padding, font scaling, grid behaviour).

## Input

Read the project's `context` for the output target and format. Read
`standards/classes.md` for the full class set. Read
`standards/tokens.md` for the `--mgf-*` variables the layout depends on.

## Output

A JSON object whose only top-level key is `layout.css`. The value is
the full CSS file contents (no markdown fences, no preamble).

## Format presets

Pick one. The variable values below slot into the `:root` token block
of `style.css`; the layout layer reads them as CSS custom properties.

### 16:9 — Presentation (default)

```
--mgf-slide-w: 1280px
--mgf-slide-h: 720px
--mgf-slide-pad-x: 80px
--mgf-slide-pad-y: 60px
```

### 1:1 — Social Carousel

```
--mgf-slide-w: 1080px
--mgf-slide-h: 1080px
--mgf-slide-pad-x: 64px
--mgf-slide-pad-y: 64px
```

### 9:16 — Story / Reel

```
--mgf-slide-w: 1080px
--mgf-slide-h: 1920px
--mgf-slide-pad-x: 48px
--mgf-slide-pad-y: 80px
```

### 4:3 — Traditional Slide

```
--mgf-slide-w: 1440px
--mgf-slide-h: 1080px
--mgf-slide-pad-x: 80px
--mgf-slide-pad-y: 60px
```

## Rules

- All class names must match `standards/classes.md` exactly.
- Only change: dimensions, padding, font sizes, grid columns, flex behavior.
- Narrow formats (9:16) should scale typography up for readability.
- Grid layouts should collapse gracefully for narrow formats — `mgf-grid-3` becomes a single column on `mgf-grid-auto` width.
- The `mgf-slide` rule must include `overflow: hidden` so content beyond the canvas is clipped, not bleeding.
- Do not emit `@media` queries. The renderer scales the canvas; the layout does not adapt.
- Output ONLY the CSS. No code fences. No commentary.
