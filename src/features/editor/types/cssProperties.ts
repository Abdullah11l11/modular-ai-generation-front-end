export type CssPropertyType =
  | 'color' | 'font' | 'size' | 'weight' | 'spacing'
  | 'text' | 'select' | 'range'
  | 'color-text' | 'line-height' | 'letter-spacing'
  | 'border-radius';

export type CssPropertyDef = {
  key: string;
  label: string;
  type: CssPropertyType;
  default: string;
  options?: string[];
  group: string;
  /** Optional CSS unit suffix rendered as a non-editable hint next to
   *  the input (e.g. `'rem'`, `'px'`, `'em'`). The full token value is
   *  still stored verbatim in the CSS — this field only annotates the
   *  panel so the user knows which unit each field expects. */
  unit?: string;
};

export type CssPropertyGroup = {
  name: string;
  label: string;
  properties: (CssPropertyDef & { value: string })[];
};

export const THEME_PROPERTIES: CssPropertyDef[] = [
  // MGF color tokens — see `src/lib/ai/prompts/standards/tokens.md`
  { key: 'mgf-color-bg', label: 'Background', type: 'color', default: '#0b0f17', group: 'colors' },
  { key: 'mgf-color-surface', label: 'Surface', type: 'color', default: '#0f1218', group: 'colors' },
  { key: 'mgf-color-surface-2', label: 'Surface 2', type: 'color', default: '#1a1f2b', group: 'colors' },
  { key: 'mgf-color-border', label: 'Border', type: 'color', default: 'rgba(255,255,255,0.08)', group: 'colors' },
  { key: 'mgf-color-border-strong', label: 'Border Strong', type: 'color', default: 'rgba(255,255,255,0.16)', group: 'colors' },
  { key: 'mgf-color-text-primary', label: 'Text Primary', type: 'color', default: '#f4f6fa', group: 'colors' },
  { key: 'mgf-color-text-secondary', label: 'Text Secondary', type: 'color', default: '#94a3b8', group: 'colors' },
  { key: 'mgf-color-text-inverse', label: 'Text Inverse', type: 'color', default: '#0b0f17', group: 'colors' },
  { key: 'mgf-color-accent', label: 'Accent', type: 'color', default: '#2f80ff', group: 'colors' },
  { key: 'mgf-color-accent-soft', label: 'Accent Soft', type: 'color', default: 'rgba(47,128,255,0.16)', group: 'colors' },
  { key: 'mgf-color-accent-2', label: 'Accent 2', type: 'color', default: '#10b981', group: 'colors' },

  // MGF typography tokens
  { key: 'mgf-font-display', label: 'Display Font', type: 'font', default: 'Inter', group: 'typography' },
  { key: 'mgf-font-body', label: 'Body Font', type: 'font', default: 'Inter', group: 'typography' },
  { key: 'mgf-font-mono', label: 'Mono Font', type: 'font', default: 'JetBrains Mono', group: 'typography' },

  // MGF spacing tokens
  { key: 'mgf-space-4', label: 'Space 4', type: 'spacing', default: '1rem', group: 'spacing' },
  { key: 'mgf-space-8', label: 'Space 8', type: 'spacing', default: '2rem', group: 'spacing' },
  { key: 'mgf-space-12', label: 'Space 12', type: 'spacing', default: '3rem', group: 'spacing' },
  { key: 'mgf-radius-lg', label: 'Radius Large', type: 'border-radius', default: '16px', group: 'spacing' },
  { key: 'mgf-radius-xl', label: 'Radius XL', type: 'border-radius', default: '24px', group: 'spacing' },
];

export const FONT_OPTIONS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Nunito', 'Playfair Display', 'Merriweather',
  'Source Sans Pro', 'Ubuntu', 'system-ui',
];

export const CONTENT_PROPERTIES: CssPropertyDef[] = [
  { key: 'title-text', label: 'Title Text', type: 'text', default: 'Title', group: 'title' },
  { key: 'title-size', label: 'Title Size', type: 'size', default: '2.5rem', group: 'title' },
  { key: 'title-weight', label: 'Title Weight', type: 'weight', default: '700', group: 'title' },
  { key: 'title-color', label: 'Title Color', type: 'color', default: '#0f172a', group: 'title' },
  { key: 'subtitle-text', label: 'Subtitle Text', type: 'text', default: 'Subtitle', group: 'subtitle' },
  { key: 'subtitle-size', label: 'Subtitle Size', type: 'size', default: '1.25rem', group: 'subtitle' },
  { key: 'subtitle-weight', label: 'Subtitle Weight', type: 'weight', default: '400', group: 'subtitle' },
  { key: 'subtitle-color', label: 'Subtitle Color', type: 'color', default: '#64748b', group: 'subtitle' },
  { key: 'body-text', label: 'Body Text', type: 'text', default: 'Body content', group: 'body' },
  { key: 'body-size', label: 'Body Size', type: 'size', default: '1rem', group: 'body' },
  { key: 'body-weight', label: 'Body Weight', type: 'weight', default: '400', group: 'body' },
  { key: 'body-color', label: 'Body Color', type: 'color', default: '#334155', group: 'body' },
];

export const STYLE_PROPERTIES: CssPropertyDef[] = [
  // Typography tokens — keys match the actual `:root` variables in
  // `standards/tokens.md` so the panel mutates real CSS, not a parallel
  // vocabulary. The `type` maps the editor control onto the right
  // input; the rendered value is the raw token value. The `unit`
  // suffix is a non-editable hint shown beside each input so the user
  // sees whether to type `1.5rem` or `1.5`.
  { key: 'mgf-text-base', label: 'Base Font Size', type: 'size', default: '1rem', group: 'typography', unit: 'rem' },
  { key: 'mgf-text-lg', label: 'Large Font Size', type: 'size', default: '1.25rem', group: 'typography', unit: 'rem' },
  { key: 'mgf-text-xl', label: 'XL Font Size', type: 'size', default: '1.75rem', group: 'typography', unit: 'rem' },
  { key: 'mgf-text-2xl', label: '2XL Font Size', type: 'size', default: '2.5rem', group: 'typography', unit: 'rem' },
  { key: 'mgf-text-3xl', label: '3XL Font Size', type: 'size', default: '3.5rem', group: 'typography', unit: 'rem' },
  { key: 'mgf-text-4xl', label: '4XL Font Size', type: 'size', default: '5rem', group: 'typography', unit: 'rem' },
  { key: 'mgf-leading-tight', label: 'Line Height (Tight)', type: 'line-height', default: '1.15', group: 'typography' },
  { key: 'mgf-leading-normal', label: 'Line Height (Normal)', type: 'line-height', default: '1.5', group: 'typography' },
  { key: 'mgf-leading-loose', label: 'Line Height (Loose)', type: 'line-height', default: '1.75', group: 'typography' },
  { key: 'mgf-tracking-tight', label: 'Letter Spacing (Tight)', type: 'letter-spacing', default: '-0.03em', group: 'typography', unit: 'em' },
  { key: 'mgf-tracking-normal', label: 'Letter Spacing (Normal)', type: 'letter-spacing', default: '0em', group: 'typography', unit: 'em' },
  { key: 'mgf-tracking-wide', label: 'Letter Spacing (Wide)', type: 'letter-spacing', default: '0.08em', group: 'typography', unit: 'em' },
  { key: 'mgf-weight-normal', label: 'Weight Normal', type: 'weight', default: '400', group: 'typography' },
  { key: 'mgf-weight-medium', label: 'Weight Medium', type: 'weight', default: '500', group: 'typography' },
  { key: 'mgf-weight-bold', label: 'Weight Bold', type: 'weight', default: '700', group: 'typography' },

  // Font-family tokens — the dropdown stores preset NAMES, but the
  // value persisted to :root is the full CSS font-family stack (with
  // the chosen family wrapped in single quotes + a sensible fallback).
  // See `FONT_STACKS` in StyleTab.tsx for the stack mapping.
  { key: 'mgf-font-body', label: 'Body Font', type: 'font', default: 'Inter', group: 'typography' },
  { key: 'mgf-font-display', label: 'Display Font', type: 'font', default: 'Inter', group: 'typography' },
  { key: 'mgf-font-mono', label: 'Mono Font', type: 'font', default: 'JetBrains Mono', group: 'typography' },

  // Spacing tokens — pad-y, pad-x, and the major spacing scale.
  // Existing seeded CSS already uses rem for the scale; the canvas
  // padding tokens are intentionally px because they're literal
  // canvas-frame values, not relative-to-root-size spacings.
  { key: 'mgf-space-1', label: 'Space 1', type: 'spacing', default: '0.25rem', group: 'spacing', unit: 'rem' },
  { key: 'mgf-space-2', label: 'Space 2', type: 'spacing', default: '0.5rem', group: 'spacing', unit: 'rem' },
  { key: 'mgf-space-3', label: 'Space 3', type: 'spacing', default: '0.75rem', group: 'spacing', unit: 'rem' },
  { key: 'mgf-space-4', label: 'Space 4', type: 'spacing', default: '1rem', group: 'spacing', unit: 'rem' },
  { key: 'mgf-space-6', label: 'Space 6', type: 'spacing', default: '1.5rem', group: 'spacing', unit: 'rem' },
  { key: 'mgf-space-8', label: 'Space 8', type: 'spacing', default: '2rem', group: 'spacing', unit: 'rem' },
  { key: 'mgf-space-12', label: 'Space 12', type: 'spacing', default: '3rem', group: 'spacing', unit: 'rem' },
  { key: 'mgf-space-16', label: 'Space 16', type: 'spacing', default: '4rem', group: 'spacing', unit: 'rem' },
  { key: 'mgf-space-24', label: 'Space 24', type: 'spacing', default: '6rem', group: 'spacing', unit: 'rem' },

  // Slide canvas padding tokens.
  { key: 'mgf-slide-pad-x', label: 'Slide Padding X', type: 'spacing', default: '80px', group: 'canvas', unit: 'px' },
  { key: 'mgf-slide-pad-y', label: 'Slide Padding Y', type: 'spacing', default: '60px', group: 'canvas', unit: 'px' },

  // Shape tokens. Existing seeded CSS uses px for radii; the unit
  // hint just confirms that to the user.
  { key: 'mgf-radius-sm', label: 'Radius SM', type: 'border-radius', default: '4px', group: 'shape', unit: 'px' },
  { key: 'mgf-radius-md', label: 'Radius MD', type: 'border-radius', default: '8px', group: 'shape', unit: 'px' },
  { key: 'mgf-radius-lg', label: 'Radius LG', type: 'border-radius', default: '16px', group: 'shape', unit: 'px' },
  { key: 'mgf-radius-xl', label: 'Radius XL', type: 'border-radius', default: '24px', group: 'shape', unit: 'px' },
];
