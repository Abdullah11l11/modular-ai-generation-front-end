export type CssPropertyType =
  | 'color' | 'font' | 'size' | 'weight' | 'spacing'
  | 'text' | 'select' | 'range'
  | 'color-text' | 'opacity' | 'line-height' | 'letter-spacing' | 'align'
  | 'border-radius' | 'z-index';

export type CssPropertyDef = {
  key: string;
  label: string;
  type: CssPropertyType;
  default: string;
  options?: string[];
  group: string;
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
  { key: 'font-size', label: 'Font Size', type: 'size', default: '16px', group: 'typography' },
  { key: 'line-height', label: 'Line Height', type: 'line-height', default: '1.5', group: 'typography' },
  { key: 'letter-spacing', label: 'Letter Spacing', type: 'letter-spacing', default: '0', group: 'typography' },
  { key: 'font-weight', label: 'Font Weight', type: 'weight', default: '400', group: 'typography' },
  { key: 'text-align', label: 'Alignment', type: 'align', default: 'left', options: ['left', 'center', 'right', 'justify'], group: 'typography' },
  { key: 'opacity', label: 'Opacity', type: 'opacity', default: '1', group: 'spacing' },
  { key: 'padding-top', label: 'Padding Top', type: 'spacing', default: '0', group: 'spacing' },
  { key: 'padding-right', label: 'Padding Right', type: 'spacing', default: '0', group: 'spacing' },
  { key: 'padding-bottom', label: 'Padding Bottom', type: 'spacing', default: '0', group: 'spacing' },
  { key: 'padding-left', label: 'Padding Left', type: 'spacing', default: '0', group: 'spacing' },
  { key: 'border-radius', label: 'Border Radius', type: 'border-radius', default: '0', group: 'spacing' },
  { key: 'z-index', label: 'Z-Index', type: 'z-index', default: '1', group: 'spacing' },
];
