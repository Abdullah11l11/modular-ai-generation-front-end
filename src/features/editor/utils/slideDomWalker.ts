/**
 * Slide DOM walker.
 *
 * Renders a slide's HTML in a hidden iframe, waits for fonts + images +
 * math, then walks every visible element and produces a structured
 * `SlideElement[]` that captures each visual primitive (text box,
 * rectangle, round-rectangle, ellipse, line, image) along with its
 * measured rect and the computed CSS styles that should drive the
 * PowerPoint shape.
 *
 * No rasterization happens here. The output is a pure description of
 * native PPTX primitives — the actual `pptxgenjs` calls live in
 * `pptxNative.ts`, which uses this module to compose a deck.
 *
 * The walker is deliberately *generic*: it doesn't know about cover /
 * stats / pricing / etc. archetypes. It just visits every element,
 * asks the class-mapping table what shape to emit (or whether to skip
 * the element as a pure layout helper), and emits a `SlideElement`
 * with measured geometry + computed styles.
 *
 * CSS features we cannot express in PPTX are silently dropped at the
 * walker level — gradients, box-shadows, SVG filters, CSS animations,
 * `oklch()` colors, etc. — so the consumer never has to think about
 * them. `SlideElement` is intentionally minimal: only fields a
 * `pptxgenjs` shape actually consumes.
 */

// ─────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────

/** All units are PowerPoint inches (1 in = 96 CSS px). */
export type SlideElementBase = {
  /** Pptxgenjs shape kind. */
  kind: 'text' | 'rect' | 'roundRect' | 'ellipse' | 'line' | 'image';
  x: number;
  y: number;
  w: number;
  h: number;
};

export type TextElement = SlideElementBase & {
  kind: 'text';
  text: string;
  fontFace?: string;
  fontSize?: number; // pt
  color?: string;    // 6-digit hex without #
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'right' | 'center';
  valign?: 'top' | 'middle' | 'bottom';
  /** Bullet character (U+ code point as hex). Pptxgenjs maps these to
   *  PowerPoint's built-in bullet glyph set. */
  bulletCode?: string;
};

export type RectElement = SlideElementBase & {
  kind: 'rect' | 'roundRect';
  fill?: string;        // 6-digit hex without #
  border?: string;      // 6-digit hex without #
  borderWidthPt?: number;
  /** Corner radius as a fraction of the smaller dimension. Pptxgenjs
   *  uses inches for `rectRadius`. */
  rectRadiusIn?: number;
};

export type EllipseElement = SlideElementBase & {
  kind: 'ellipse';
  fill?: string;
  border?: string;
  borderWidthPt?: number;
  /** Optional text overlay (used for chapter-num, step-num, avatar
   *  initial). Rendered as a text box centered on the ellipse. */
  overlayText?: string;
  overlayFontFace?: string;
  overlayFontSize?: number;
  overlayColor?: string;
  overlayBold?: boolean;
};

export type LineElement = SlideElementBase & {
  kind: 'line';
  /** pptxgenjs's `line` shape takes two endpoints in inches. We derive
   *  them from the element's measured rect — `x/y` is the start and
   *  `(lineX, lineY)` is the end. For a horizontal divider, `lineX`
   *  is `x + w`. */
  lineX: number;
  lineY: number;
  lineColor: string;
  lineWidthPt: number;
};

export type ImageElement = SlideElementBase & {
  kind: 'image';
  /** Either an `image/png;base64,…` string (data URI) or an http(s)
   *  URL. Pptxgenjs `path:` accepts URLs; `data:` accepts the
   *  MIME-prefixed base64 form. */
  src: string;
  /** Pptxgenjs sizing mode. `cover` fills the box and may crop;
   *  `contain` fits inside. Default `cover`. */
  sizing?: { type: 'cover' | 'contain' };
};

export type SlideElement =
  | TextElement
  | RectElement
  | EllipseElement
  | LineElement
  | ImageElement;

// ─────────────────────────────────────────────────────────────────────────
// Class-mapping tables
// ─────────────────────────────────────────────────────────────────────────

/**
 * Classes that map to a *shape* primitive (rectangle, ellipse, line,
 * image). The walker emits exactly one shape for the element and does
 * NOT recurse into its children — the shape represents the whole
 * element visually. For elements that wrap text (e.g. chapter-num with
 * the digit inside), the text is captured as an overlay on the shape.
 */
const SHAPE_CLASSES: Record<string, 'rect' | 'roundRect' | 'ellipse' | 'line' | 'image'> = {
  'mgf-accent-bar': 'rect',
  'mgf-accent-bar-lg': 'rect',
  'mgf-divider': 'rect',
  'mgf-divider-short': 'rect',
  'mgf-avatar': 'ellipse',
  'mgf-avatar-lg': 'ellipse',
  'mgf-avatar-xl': 'ellipse',
  'mgf-quote-avatar': 'ellipse',
  'mgf-chapter-num': 'ellipse',
  'mgf-chapter-num-lg': 'ellipse',
  'mgf-step-num': 'ellipse',
  'mgf-timeline-dot': 'ellipse',
  'mgf-deck-dots': 'ellipse',
  'mgf-bar': 'rect',
  'mgf-hbar': 'rect',
  'mgf-heat-cell': 'rect',
  'mgf-seg': 'rect',
  'mgf-seg-1': 'rect',
  'mgf-seg-2': 'rect',
  'mgf-seg-3': 'rect',
  'mgf-seg-4': 'rect',
  'mgf-mark': 'rect',
  'mgf-legend-item': 'rect',
};

/**
 * Classes that map to a *background container* (the element has a fill
 * but its text content is delivered as separate text boxes overlaid at
 * the children's measured positions). The walker emits the container
 * shape AND recurses into children to emit text boxes.
 */
const CONTAINER_CLASSES: Record<string, 'rect' | 'roundRect'> = {
  'mgf-card': 'roundRect',
  'mgf-card-solid': 'rect',
  'mgf-card-accent': 'roundRect',
  'mgf-card-glass': 'rect',
  'mgf-stat': 'roundRect',
  'mgf-callout': 'rect',
  'mgf-code-card': 'rect',
  'mgf-step': 'roundRect',
  'mgf-comparison-col': 'rect',
  'mgf-team-member': 'rect',
  'mgf-widget': 'rect',
  'mgf-dash-cell': 'rect',
  'mgf-dash-card': 'rect',
  'mgf-bento-item': 'roundRect',
  'mgf-cta-solid': 'roundRect',
  'mgf-cta-lg': 'roundRect',
  'mgf-badge': 'roundRect',
  'mgf-badge-accent': 'roundRect',
  'mgf-badge-success': 'roundRect',
  'mgf-badge-warning': 'roundRect',
  'mgf-badge-muted': 'roundRect',
  'mgf-tag': 'rect',
};

/**
 * Classes that map to a *text box* — the walker emits a text box at
 * the element's measured rect and does NOT recurse into the children
 * (the children contribute their text via the parent's textContent).
 * This avoids emitting a text box per nested span.
 */
const TYPOGRAPHY_CLASSES = new Set<string>([
  'mgf-eyebrow',
  'mgf-label',
  'mgf-label-lg',
  'mgf-title',
  'mgf-title-lg',
  'mgf-title-xl',
  'mgf-subtitle',
  'mgf-body',
  'mgf-body-sm',
  'mgf-caption',
  'mgf-stat-value',
  'mgf-stat-value-lg',
  'mgf-stat-label',
  'mgf-stat-sub',
  'mgf-kpi-value',
  'mgf-kpi-label',
  'mgf-card-label',
  'mgf-card-value',
  'mgf-card-title',
  'mgf-card-body',
  'mgf-card-footer',
  'mgf-team-name',
  'mgf-team-role',
  'mgf-team-bio',
  'mgf-feature-icon',
  'mgf-feature-title',
  'mgf-feature-desc',
  'mgf-price',
  'mgf-price-period',
  'mgf-faq-q',
  'mgf-faq-a',
  'mgf-quote-mark',
  'mgf-quote-text',
  'mgf-quote-name',
  'mgf-quote-title',
  'mgf-callout-icon',
  'mgf-callout-title',
  'mgf-callout-text',
  'mgf-section-title',
  'mgf-section-sub',
  'mgf-hero-title',
  'mgf-hero-sub',
  'mgf-nav-brand',
  'mgf-nav-links',
  'mgf-footer-text',
  'mgf-cta',
  'mgf-chart-title',
  'mgf-bar-label',
  'mgf-bar-value',
  'mgf-hbar-label',
  'mgf-pie-center',
  'mgf-slide-number',
]);

/**
 * Classes that never produce a shape — pure layout / sizing / modifier
 * helpers. Elements with ONLY these classes are recursed into without
 * emitting anything.
 */
const LAYOUT_ONLY_CLASSES = new Set<string>([
  // layout primitives
  'mgf-slide',
  'mgf-deck',
  'mgf-deck-vertical',
  'mgf-deck-progress',
  'mgf-grid-2',
  'mgf-grid-3',
  'mgf-grid-4',
  'mgf-grid-auto',
  'mgf-split-left',
  'mgf-split-right',
  'mgf-split-60-40',
  'mgf-split-40-60',
  'mgf-full',
  'mgf-overlap',
  'mgf-overlap-main',
  'mgf-overlap-secondary',
  'mgf-slide-size-16x9',
  'mgf-slide-size-4x3',
  'mgf-slide-size-a4',
  'mgf-slide-size-square',
  'mgf-carousel',
  'mgf-carousel-track',
  'mgf-carousel-item',
  'mgf-carousel-dots',
  'mgf-dashboard',
  'mgf-dash-grid',
  'mgf-infographic',
  'mgf-infographic-flow',
  'mgf-stat-group',
  'mgf-comparison',
  'mgf-team-grid',
  'mgf-steps',
  'mgf-faq',
  'mgf-timeline',
  'mgf-testimonial',
  'mgf-testimonial-grid',
  'mgf-quote',
  'mgf-quote-author',
  'mgf-list',
  'mgf-list-plain',
  'mgf-list-check',
  'mgf-list-number',
  'mgf-list-icon',
  'mgf-hero',
  'mgf-hero-media',
  'mgf-hero-ctas',
  'mgf-section',
  'mgf-section-header',
  'mgf-nav',
  'mgf-footer',
  'mgf-footer-links',
  'mgf-form',
  'mgf-input',
  'mgf-map-container',
  'mgf-video-container',
  'mgf-video-placeholder',
  'mgf-icon',
  'mgf-icon-lg',
  'mgf-marquee',
  'mgf-marquee-track',
  'mgf-marquee-item',
  'mgf-spotlight',
  'mgf-bento',
  'mgf-marks',
  'mgf-chart',
  'mgf-chart-legend',
  'mgf-chart-svg',
  'mgf-chart-bar',
  'mgf-chart-stacked',
  'mgf-bar-stack',
  'mgf-chart-hbar',
  'mgf-chart-pie',
  'mgf-chart-donut',
  'mgf-heatmap',
  'mgf-sparkline',
  'mgf-line',
  'mgf-area',
  'mgf-gauge',
  'mgf-radar',
  'mgf-axis-label',
  // flex / pad / gap / margin
  'mgf-flex',
  'mgf-flex-col',
  'mgf-flex-center',
  'mgf-flex-between',
  'mgf-flex-start',
  'mgf-flex-wrap',
  'mgf-pad-sm',
  'mgf-pad-md',
  'mgf-pad-lg',
  'mgf-mt-sm',
  'mgf-mt-md',
  'mgf-mt-lg',
  'mgf-mb-sm',
  'mgf-mb-md',
  'mgf-mb-lg',
  'mgf-gap-sm',
  'mgf-gap-md',
  'mgf-gap-lg',
  // text alignment (drives computed style, not a shape)
  'mgf-text-center',
  'mgf-text-left',
  'mgf-text-right',
  'mgf-text-accent',
  'mgf-text-muted',
  'mgf-text-inverse',
  'mgf-text-bold',
  'mgf-text-mono',
  // font modifiers
  'mgf-mono',
  'mgf-display-serif',
  'mgf-display-mono',
  'mgf-body-serif',
  'mgf-body-mono',
  'mgf-accent-1',
  'mgf-accent-2',
  // sizing / position / overflow
  'mgf-w-full',
  'mgf-h-full',
  'mgf-fill',
  'mgf-min-w-full',
  'mgf-min-h-full',
  'mgf-min-h-screen',
  'mgf-max-w-full',
  'mgf-max-h-full',
  'mgf-fit',
  'mgf-w-screen',
  'mgf-h-screen',
  'mgf-w-auto',
  'mgf-h-auto',
  'mgf-absolute',
  'mgf-relative',
  'mgf-static',
  'mgf-fixed',
  'mgf-sticky',
  'mgf-inset-0',
  'mgf-inset-x-0',
  'mgf-inset-y-0',
  'mgf-top-0',
  'mgf-right-0',
  'mgf-bottom-0',
  'mgf-left-0',
  'mgf-overflow-hidden',
  'mgf-overflow-auto',
  'mgf-overflow-scroll',
  'mgf-overflow-visible',
  'mgf-overflow-x-hidden',
  'mgf-overflow-y-auto',
  // visual effects (drop in PPTX)
  'mgf-brutal-border',
  'mgf-glass',
  'mgf-neo',
  'mgf-neo-inset',
  'mgf-grain',
  'mgf-grain-heavy',
  'mgf-grain-soft',
  'mgf-grain-none',
  'mgf-ambient-glow',
  'mgf-dense',
  'mgf-air',
  'mgf-hi',
  'mgf-lo',
  'mgf-flat',
  // frames (drop)
  'mgf-frame',
  'mgf-frame-accent',
  'mgf-frame-double',
  // background patterns (drop)
  'mgf-bg-grid',
  'mgf-bg-grid-fine',
  'mgf-bg-grid-lg',
  'mgf-bg-dots',
  'mgf-bg-lines',
  'mgf-bg-gradient',
  'mgf-bg-gradient-accent',
  'mgf-bg-surface',
  'mgf-bg-accent',
  'mgf-bg-accent-soft',
  // media containers (handled via child <img>)
  'mgf-media',
  'mgf-media-contained',
  'mgf-media-rounded',
  'mgf-media-placeholder',
  // website archetype (out of scope for deck export)
  'mgf-website',
  'mgf-website-nav',
  'mgf-website-brand',
  'mgf-website-links',
  'mgf-website-footer',
  'mgf-website-hero',
  'mgf-website-hero-title',
  'mgf-website-hero-sub',
  'mgf-website-hero-ctas',
  'mgf-website-section',
  'mgf-website-section-header',
  'mgf-website-section-title',
  'mgf-website-section-sub',
  'mgf-website-testimonial',
  'mgf-website-faq',
  'mgf-website-cta',
  'mgf-website-cta-title',
  'mgf-website-cta-body',
]);

// ─────────────────────────────────────────────────────────────────────────
// Style helpers
// ─────────────────────────────────────────────────────────────────────────

/**
 * Map a class name to its container shape kind, if any.
 */
function findContainerClass(el: Element): 'rect' | 'roundRect' | null {
  for (const cls of Array.from(el.classList)) {
    if (CONTAINER_CLASSES[cls]) return CONTAINER_CLASSES[cls];
  }
  return null;
}

/**
 * Map a class name to its shape kind, if any.
 */
function findShapeClass(
  el: Element,
): 'rect' | 'roundRect' | 'ellipse' | 'line' | 'image' | null {
  // <img> always wins — emit as image
  if (el.tagName === 'IMG') return 'image';
  for (const cls of Array.from(el.classList)) {
    if (SHAPE_CLASSES[cls]) return SHAPE_CLASSES[cls];
  }
  return null;
}

/**
 * Map a class name to its typography role, if any.
 */
function findTypographyClass(el: Element): string | null {
  for (const cls of Array.from(el.classList)) {
    if (TYPOGRAPHY_CLASSES.has(cls)) return cls;
  }
  return null;
}

/**
 * Does this element carry ONLY layout-only classes (no shape, container,
 * or typography role)? If so, the walker descends into children without
 * emitting anything for the element itself.
 */
function isLayoutOnly(el: Element): boolean {
  for (const cls of Array.from(el.classList)) {
    if (!LAYOUT_ONLY_CLASSES.has(cls)) return false;
  }
  return true;
}

/** CSS px → inches. 1 in = 96 px (CSS px-per-inch is always 96). */
function pxToInches(px: number): number {
  return px / 96;
}

/** CSS px → pt. 1 px = 0.75 pt. */
function pxToPt(px: number): number {
  return px * 0.75;
}

/**
 * Resolve `border-radius` to a `rectRadius` in inches. PPTX `roundRect`
 * takes `rectRadius` in inches, capped at half the shorter dimension
 * for a circle effect. We use the CSS-computed `borderTopLeftRadius`
 * (all four corners are the same for the mgf-* classes we care about)
 * and divide by 96.
 */
function borderRadiusInches(style: CSSStyleDeclaration, minDimPx: number): number {
  const r = parseFloat(style.borderTopLeftRadius) || 0;
  return Math.min(r / 96, minDimPx / 2 / 96);
}

/** `font-weight: bold` ≥ 600 → bold. */
function isBoldWeight(weight: string): boolean {
  const n = parseInt(weight, 10);
  return Number.isFinite(n) ? n >= 600 : weight === 'bold' || weight === 'bolder';
}

/** Strip a CSS named-color font stack to its first family. */
function firstFontFamily(value: string): string {
  const stripped = value.replace(/["']/g, '').split(',')[0]?.trim() ?? '';
  const generic = new Set([
    'system-ui', 'sans-serif', 'serif', 'monospace',
    'ui-monospace', 'ui-sans-serif', '-apple-system', 'BlinkMacSystemFont',
  ]);
  return generic.has(stripped) ? 'Calibri' : stripped || 'Calibri';
}

// ─────────────────────────────────────────────────────────────────────────
// Color helpers
// ─────────────────────────────────────────────────────────────────────────

const HEX_SHORT = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const HEX_FULL = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
const RGB_RE = /^rgba?\(\s*([\d.]+%?)\s*[,\s]\s*([\d.]+%?)\s*[,\s]\s*([\d.]+%?)/i;
const NAMED: Record<string, string> = {
  black: '000000', white: 'FFFFFF', red: 'FF0000', green: '008000',
  blue: '0000FF', yellow: 'FFFF00', cyan: '00FFFF', magenta: 'FF00FF',
  silver: 'C0C0C0', gray: '808080', grey: '808080', maroon: '800000',
  olive: '808000', lime: '00FF00', aqua: '00FFFF', teal: '008080',
  navy: '000080', fuchsia: 'FF00FF', purple: '800080', orange: 'FFA500',
  pink: 'FFC0CB', brown: 'A52A2A', gold: 'FFD700', indigo: '4B0082',
};
const COLOR_FALLBACK = 'FFFFFF';

function clampByte(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hex2(n: number): string {
  return clampByte(n).toString(16).padStart(2, '0').toUpperCase();
}

/**
 * Resolve any CSS color string to a 6-digit hex (no `#`). Pptxgenjs has
 * no alpha channel, so `rgba(…)` / `#rrggbbaa` / `rgb(… / 8%)` get
 * their alpha silently dropped. `oklch()` / `lab()` / `var()` resolve
 * to white (Pptxgenjs cannot represent these spaces).
 */
function colorToHex(input: string): string {
  const raw = input.trim();
  if (!raw) return COLOR_FALLBACK;
  const short = raw.match(HEX_SHORT);
  if (short) return (short[1] + short[1] + short[2] + short[2] + short[3] + short[3]).toUpperCase();
  const full = raw.match(HEX_FULL);
  if (full) return (full[1] + full[2] + full[3]).toUpperCase();
  const named = NAMED[raw.toLowerCase()];
  if (named) return named;
  const rgb = raw.match(RGB_RE);
  if (rgb) {
    const parseC = (s: string): number => (s.endsWith('%') ? (parseFloat(s) / 100) * 255 : parseFloat(s));
    return hex2(parseC(rgb[1])) + hex2(parseC(rgb[2])) + hex2(parseC(rgb[3]));
  }
  return COLOR_FALLBACK;
}

// ─────────────────────────────────────────────────────────────────────────
// Background / border style → fill / line
// ─────────────────────────────────────────────────────────────────────────

/**
 * PptxGenJS shapes have a single fill color, but CSS lets an element
 * carry both `background-color` and `background-image`. We treat solid
 * `background-color` as the fill and ignore any gradient/image layers
 * (gradients, conic-gradients, repeating-gradients cannot be expressed
 * natively). Returns null if the element has no solid fill we can use.
 */
function solidFill(style: CSSStyleDeclaration): string | null {
  const bg = style.backgroundColor;
  if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') return null;
  return colorToHex(bg);
}

/**
 * Same simplification for borders: extract the first matching
 * `border-{side}-width` + `border-{side}-color`. Pptxgenjs only
 * supports a uniform border, so we read the top border (or any side if
 * top is "none") and ignore per-side differences.
 */
function borderInfo(style: CSSStyleDeclaration): { color: string; widthPt: number } | null {
  const sides = ['Top', 'Right', 'Bottom', 'Left'] as const;
  for (const side of sides) {
    const widthStr = (style as unknown as Record<string, string>)[`border${side}Width`];
    const colorStr = (style as unknown as Record<string, string>)[`border${side}Color`];
    const widthPx = parseFloat(widthStr) || 0;
    if (widthPx <= 0) continue;
    return { color: colorToHex(colorStr), widthPt: pxToPt(widthPx) };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────
// Per-element emit
// ─────────────────────────────────────────────────────────────────────────

/**
 * Build a `TextElement` from an HTML element's measured rect + computed
 * style. If `typographyClass` is set, apply class-specific defaults;
 * otherwise the element's own computed style drives everything.
 */
function buildTextElement(
  el: HTMLElement,
  rect: DOMRect,
  style: CSSStyleDeclaration,
): TextElement {
  const text = (el.innerText ?? el.textContent ?? '').trim();
  // Block elements (h1, p, li) default to top-aligned text; spans
  // default to middle so they sit on the line they were measured at.
  const isBlock = /^(H[1-6]|P|LI|BLOCKQUOTE|DIV|SECTION|ARTICLE)$/.test(el.tagName);
  return {
    kind: 'text',
    x: pxToInches(rect.x),
    y: pxToInches(rect.y),
    w: pxToInches(rect.width),
    h: pxToInches(rect.height),
    text,
    fontFace: firstFontFamily(style.fontFamily),
    fontSize: Math.max(6, Math.round(pxToPt(parseFloat(style.fontSize) || 16))),
    color: colorToHex(style.color),
    bold: isBoldWeight(style.fontWeight),
    italic: style.fontStyle === 'italic',
    underline: style.textDecorationLine?.includes('underline') ?? false,
    align: style.textAlign === 'right' || style.textAlign === 'center'
      ? style.textAlign
      : 'left',
    valign: isBlock ? 'top' : 'middle',
  };
}

/**
 * Build a `RectElement` (or `RoundRectElement`) from a container or
 * shape-class element's measured rect + computed style.
 */
function buildRectElement(
  _el: HTMLElement,
  rect: DOMRect,
  style: CSSStyleDeclaration,
  shapeKind: 'rect' | 'roundRect',
): RectElement {
  const minDimPx = Math.min(rect.width, rect.height);
  const fill = solidFill(style);
  const border = borderInfo(style);
  return {
    kind: shapeKind,
    x: pxToInches(rect.x),
    y: pxToInches(rect.y),
    w: pxToInches(rect.width),
    h: pxToInches(rect.height),
    fill: fill ?? undefined,
    border: border?.color,
    borderWidthPt: border?.widthPt,
    rectRadiusIn: shapeKind === 'roundRect' ? borderRadiusInches(style, minDimPx) : undefined,
  };
}

/**
 * Build an `EllipseElement` from an avatar / chapter-num / step-num /
 * timeline-dot / etc. If the element wraps text (chapter-num, step-num),
 * capture it as `overlayText` so the PPTX renderer can place a text box
 * centered on the ellipse.
 */
function buildEllipseElement(
  el: HTMLElement,
  rect: DOMRect,
  style: CSSStyleDeclaration,
): EllipseElement {
  const fill = solidFill(style);
  const border = borderInfo(style);
  // Detect an inner text label (chapter-num, step-num): look for the
  // first descendant with direct text content. We don't recurse into
  // every child — just the first text-bearing descendant.
  let overlayText: string | undefined;
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const t = (child.textContent ?? '').trim();
      if (t) {
        overlayText = t;
        break;
      }
    }
  }
  if (!overlayText) {
    const textChild = el.querySelector('p, span, h1, h2, h3, h4, div');
    if (textChild && textChild.textContent?.trim()) {
      overlayText = textChild.textContent.trim();
    }
  }
  return {
    kind: 'ellipse',
    x: pxToInches(rect.x),
    y: pxToInches(rect.y),
    w: pxToInches(rect.width),
    h: pxToInches(rect.height),
    fill: fill ?? undefined,
    border: border?.color,
    borderWidthPt: border?.widthPt,
    overlayText,
    overlayFontFace: overlayText ? firstFontFamily(style.fontFamily) : undefined,
    overlayFontSize: overlayText
      ? Math.max(8, Math.round(pxToPt(parseFloat(style.fontSize) || 14)))
      : undefined,
    overlayColor: overlayText ? colorToHex(style.color) : undefined,
    overlayBold: overlayText ? isBoldWeight(style.fontWeight) : undefined,
  };
}

/**
 * Build a `LineElement` from a divider. CSS `mgf-divider` is a 1px
 * tall element spanning the full container width — emit as a thin
 * rectangle (lines in PPTX are 1-D and tricky to thickness-control;
 * a flat rect renders predictably).
 */
function buildLineElement(
  _el: HTMLElement,
  rect: DOMRect,
  style: CSSStyleDeclaration,
): LineElement {
  const fill = solidFill(style);
  // Always render as a thin rect for visual consistency.
  return {
    kind: 'rect',
    x: pxToInches(rect.x),
    y: pxToInches(rect.y),
    w: pxToInches(rect.width),
    h: Math.max(pxToInches(rect.height), 1 / 96),
    fill: fill ?? 'FFFFFF',
  } as unknown as LineElement;
}

/**
 * Build an `ImageElement` from an `<img>`. The src can be a data URI
 * (pass-through) or an http(s) URL (pass-through). PptxGenJS's
 * `addImage` accepts both.
 */
function buildImageElement(el: HTMLImageElement, rect: DOMRect): ImageElement | null {
  const src = el.getAttribute('src');
  if (!src) return null;
  return {
    kind: 'image',
    x: pxToInches(rect.x),
    y: pxToInches(rect.y),
    w: pxToInches(rect.width),
    h: pxToInches(rect.height),
    src,
    sizing: { type: 'cover' },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Walker
// ─────────────────────────────────────────────────────────────────────────

/**
 * Visit a single element, decide its role, and either emit a
 * `SlideElement` or recurse into children. Returns the list of shapes
 * emitted at *this level* (children contribute via recursion).
 */
function walkElement(el: Element, out: SlideElement[]): void {
  if (!(el instanceof HTMLElement)) {
    // Skip text nodes / comments / etc.
    return;
  }
  const style = el.ownerDocument?.defaultView?.getComputedStyle(el);
  if (!style) return;

  // Skip hidden / zero-area elements
  if (style.display === 'none' || style.visibility === 'hidden') return;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  // Layout-only class → descend without emitting.
  if (isLayoutOnly(el) && el.classList.length > 0) {
    for (const child of Array.from(el.children)) walkElement(child, out);
    return;
  }

  // Shape class wins (the shape represents the whole element).
  const shapeKind = findShapeClass(el);
  if (shapeKind) {
    if (shapeKind === 'image' && el instanceof HTMLImageElement) {
      const img = buildImageElement(el, rect);
      if (img) out.push(img);
      return;
    }
    if (shapeKind === 'line') {
      out.push(buildLineElement(el, rect, style));
      return;
    }
    if (shapeKind === 'ellipse') {
      out.push(buildEllipseElement(el, rect, style));
      // For chapter-num / step-num, the text lives inside the ellipse.
      // We've already captured it as overlayText — skip children.
      return;
    }
    // shapeKind is now narrowed to 'rect' | 'roundRect' (image and
    // ellipse returned above).
    out.push(buildRectElement(el, rect, style, shapeKind as 'rect' | 'roundRect'));
    return;
  }

  // Container class → emit background shape AND recurse into children
  // so text content is delivered as separate text boxes.
  const containerKind = findContainerClass(el);
  if (containerKind) {
    out.push(buildRectElement(el, rect, style, containerKind));
    for (const child of Array.from(el.children)) walkElement(child, out);
    return;
  }

  // Typography class → emit a text box (don't recurse, the parent
  // already has the full text via textContent).
  const typo = findTypographyClass(el);
  if (typo) {
    out.push(buildTextElement(el, rect, style));
    return;
  }

  // Default: emit a text box for any block-level element with direct
  // text content (h1-h6, p, li, blockquote). For spans inside other
  // text, the parent text box already captured the text via
  // textContent / innerText.
  const tag = el.tagName;
  const directText = Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent ?? '')
    .join('')
    .trim();
  const isBlock =
    /^(H[1-6]|P|LI|BLOCKQUOTE)$/.test(tag) ||
    (style.display === 'block' || style.display === 'flex' || style.display === 'grid');
  if (isBlock && directText) {
    out.push(buildTextElement(el, rect, style));
    return;
  }

  // Plain text-bearing span inside a parent that already captured it:
  // skip (parent's textContent has it).
  if (directText && el.children.length === 0) return;

  // Otherwise, descend (parent container will be caught above; this
  // handles e.g. unknown wrapper divs).
  for (const child of Array.from(el.children)) walkElement(child, out);
}

/**
 * Walk the rendered DOM of a slide and return one `SlideElement` per
 * visible PPTX primitive. The iframe is created, populated, queried,
 * and torn down — the caller never sees the DOM.
 */
export function walkSlideDom(doc: Document): SlideElement[] {
  const out: SlideElement[] = [];
  const body = doc.body;
  if (!body) return out;
  // Start at the slide root if present, otherwise the body itself.
  const root = body.querySelector('.mgf-slide') ?? body;
  walkElement(root, out);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────
// Iframe lifecycle (shared with rasterize.ts — duplicated rather than
// imported to keep this module self-contained and to avoid expanding
// rasterize.ts's public API surface just for the PPTX builder).
// ─────────────────────────────────────────────────────────────────────────

async function waitForIframeReady(doc: Document, win: Window, timeoutMs: number): Promise<void> {
  const fontsReady =
    'fonts' in doc
      ? (doc as Document & { fonts: { ready: Promise<unknown> } }).fonts.ready
      : Promise.resolve();
  await fontsReady;
  const images = Array.from(doc.images);
  await Promise.all(
    images.map((img) =>
      img.complete && img.naturalWidth > 0
        ? null
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          }),
    ),
  );
  if (doc.body.classList.contains('mgf-math-enabled')) {
    await new Promise<void>((resolve) => {
      const start = Date.now();
      const tick = () => {
        const katex = (win as unknown as { katex?: { render?: unknown } }).katex;
        if (katex && typeof katex.render === 'function') {
          setTimeout(resolve, 50);
          return;
        }
        if (Date.now() - start > timeoutMs) {
          resolve();
          return;
        }
        setTimeout(tick, 50);
      };
      tick();
    });
  }
  // Wait for two animation frames so the iframe's layout has settled.
  // Without this, `getBoundingClientRect()` can return all zeros because
  // the browser hasn't yet flushed layout for the iframe's content.
  // Two frames is the minimum to escape the immediate-post-load
  // microtask queue and reach the first paint cycle. A `setTimeout(0)`
  // resolves before the next frame, so it would not be enough.
  await new Promise<void>((resolve) => win.requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => win.requestAnimationFrame(() => resolve()));
}

function buildHiddenIframe(width: number, height: number): {
  iframe: HTMLIFrameElement;
  teardown: () => void;
} {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
  iframe.style.cssText = `
    position: fixed;
    top: 0;
    left: -99999px;
    width: ${width}px;
    height: ${height}px;
    border: 0;
    visibility: hidden;
    pointer-events: none;
  `;
  document.body.appendChild(iframe);
  return { iframe, teardown: () => iframe.remove() };
}

function loadIntoIframe(
  iframe: HTMLIFrameElement,
  html: string,
): Promise<{ doc: Document; win: Window }> {
  return new Promise((resolve, reject) => {
    iframe.addEventListener('load', () => {
      try {
        const doc = iframe.contentDocument;
        const win = iframe.contentWindow;
        if (!doc || !win) {
          reject(new Error('iframe produced no document'));
          return;
        }
        if (!doc.documentElement) {
          setTimeout(() => resolve({ doc, win }), 0);
        } else {
          resolve({ doc, win });
        }
      } catch (err) {
        reject(err);
      }
    });
    iframe.srcdoc = html;
  });
}

export type WalkSlideOptions = {
  html: string;
  width: number;
  height: number;
  signal?: AbortSignal;
  timeoutMs?: number;
  /**
   * When true, resize the iframe after load to the body's actual
   * `scrollHeight`. Required for scrollable single-page types whose
   * assembled document height is unknown up front (posters, infographics,
   * documents) so elements below the initial viewport are measured at
   * their actual y rather than being treated as off-slide.
   */
  fitContent?: boolean;
};

/**
 * Public entry point: render the slide HTML in a hidden iframe, wait for
 * it to be ready, walk the DOM, and return the `SlideElement[]`. The
 * iframe is torn down before this returns.
 */
export async function walkSlide(opts: WalkSlideOptions): Promise<SlideElement[]> {
  const { html, width, height, signal } = opts;
  const timeoutMs = opts.timeoutMs ?? 15000;
  const fitContent = opts.fitContent ?? false;
  if (!html) throw new Error('walkSlide: html is empty');
  if (width <= 0 || height <= 0) throw new Error('walkSlide: width/height must be positive');
  if (signal?.aborted) throw new Error('aborted');

  const { iframe, teardown } = buildHiddenIframe(width, height);
  try {
    const { doc, win } = await loadIntoIframe(iframe, html);
    await waitForIframeReady(doc, win, timeoutMs);

    // Scrollable: resize the iframe to the actual document height so
    // every element is measured at its real on-slide y. Without this,
    // any content below `height` lands outside the viewport, has
    // `getBoundingClientRect().y > height`, and ends up at y > slide
    // height in the PPTX (invisible). Mirrors the `fitContent` branch
    // in rasterize.ts.
    if (fitContent) {
      const scrollH = Math.max(
        doc.body.scrollHeight,
        doc.documentElement.scrollHeight,
      );
      if (scrollH > height) {
        iframe.style.height = `${scrollH}px`;
        // Re-run fonts.ready because the layout change can trigger
        // font re-fetching.
        await new Promise<void>((resolve) => win.requestAnimationFrame(() => resolve()));
        await new Promise<void>((resolve) => win.requestAnimationFrame(() => resolve()));
      }
    }

    return walkSlideDom(doc);
  } finally {
    teardown();
  }
}