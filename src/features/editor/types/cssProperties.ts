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
  // MGF defaults (legacy single-page convention)
  { key: 'background-color', label: 'Background', type: 'color', default: '#ffffff', group: 'colors' },
  { key: 'title-font-size', label: 'Title Font Size', type: 'size', default: '2rem', group: 'title' },
  { key: 'title-text-color', label: 'Title Text Color', type: 'color', default: '#0f172a', group: 'title' },
  { key: 'title-text-align', label: 'Title Text Align', type: 'align', default: 'left', options: ['left', 'center', 'right'], group: 'title' },
  { key: 'title-margin-bottom', label: 'Title Margin Bottom', type: 'spacing', default: '0.5rem', group: 'title' },
  { key: 'title-margin-top', label: 'Title Margin Top', type: 'spacing', default: '0', group: 'title' },

  // UVCP theme tokens (seeded projects)
  { key: 'uvcp-color-bg', label: 'UVCP Background', type: 'color', default: '#080A0F', group: 'uvcp colors' },
  { key: 'uvcp-color-surface', label: 'UVCP Surface', type: 'color', default: '#0F1218', group: 'uvcp colors' },
  { key: 'uvcp-color-accent', label: 'UVCP Accent', type: 'color', default: '#2F80FF', group: 'uvcp colors' },
  { key: 'uvcp-color-text-primary', label: 'UVCP Text', type: 'color', default: '#F4F6FA', group: 'uvcp colors' },
  { key: 'uvcp-font-display', label: 'UVCP Display Font', type: 'font', default: 'Inter', group: 'uvcp typography' },
  { key: 'uvcp-font-body', label: 'UVCP Body Font', type: 'font', default: 'Inter', group: 'uvcp typography' },
  { key: 'uvcp-space-4', label: 'UVCP Space 4', type: 'spacing', default: '1rem', group: 'uvcp spacing' },
  { key: 'uvcp-space-8', label: 'UVCP Space 8', type: 'spacing', default: '2rem', group: 'uvcp spacing' },
  { key: 'uvcp-radius-lg', label: 'UVCP Radius Large', type: 'border-radius', default: '14px', group: 'uvcp spacing' },
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
