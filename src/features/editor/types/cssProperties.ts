export type CssPropertyType = 'color' | 'font' | 'size' | 'spacing' | 'select' | 'slider' | 'string';

export type CssPropertyDef = {
  varName: string;
  label: string;
  type: CssPropertyType;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue: string;
  group: string;
};

export type CssPropertyGroup = {
  id: string;
  label: string;
  properties: (CssPropertyDef & { currentValue: string })[];
};

export const THEME_PROPERTIES: CssPropertyDef[] = [
  { varName: '--primary-color', label: 'Primary Color', type: 'color', defaultValue: '#000000', group: 'Colors' },
  { varName: '--secondary-color', label: 'Secondary Color', type: 'color', defaultValue: '#333333', group: 'Colors' },
  { varName: '--accent-color', label: 'Accent Color', type: 'color', defaultValue: '#09b8c4', group: 'Colors' },
  { varName: '--bg-color', label: 'Background', type: 'color', defaultValue: '#ffffff', group: 'Colors' },
  { varName: '--text-primary', label: 'Text Primary', type: 'color', defaultValue: '#111110', group: 'Colors' },
  { varName: '--text-secondary', label: 'Text Secondary', type: 'color', defaultValue: '#5a5855', group: 'Colors' },
  { varName: '--font-heading', label: 'Heading Font', type: 'font', defaultValue: 'sans-serif', group: 'Typography' },
  { varName: '--font-body', label: 'Body Font', type: 'font', defaultValue: 'sans-serif', group: 'Typography' },
];

export const CONTENT_PROPERTIES: CssPropertyDef[] = [
  { varName: '--title-content', label: 'Title', type: 'string', defaultValue: 'Title', group: 'Text' },
  { varName: '--title-size', label: 'Title Size', type: 'size', defaultValue: '32px', group: 'Text' },
  { varName: '--title-weight', label: 'Title Weight', type: 'select', options: ['300', '400', '500', '600', '700', '800', '900'], defaultValue: '700', group: 'Text' },
  { varName: '--title-color', label: 'Title Color', type: 'color', defaultValue: '#111110', group: 'Text' },
  { varName: '--subtitle-content', label: 'Subtitle', type: 'string', defaultValue: 'Subtitle', group: 'Text' },
  { varName: '--subtitle-size', label: 'Subtitle Size', type: 'size', defaultValue: '18px', group: 'Text' },
  { varName: '--subtitle-weight', label: 'Subtitle Weight', type: 'select', options: ['300', '400', '500', '600', '700'], defaultValue: '400', group: 'Text' },
  { varName: '--subtitle-color', label: 'Subtitle Color', type: 'color', defaultValue: '#5a5855', group: 'Text' },
  { varName: '--body-content', label: 'Body Text', type: 'string', defaultValue: '', group: 'Text' },
  { varName: '--body-size', label: 'Body Size', type: 'size', defaultValue: '16px', group: 'Text' },
];

export const STYLE_PROPERTIES: CssPropertyDef[] = [
  { varName: '--font-size', label: 'Font Size', type: 'size', defaultValue: '16px', group: 'Typography' },
  { varName: '--line-height', label: 'Line Height', type: 'size', defaultValue: '1.5', group: 'Typography' },
  { varName: '--letter-spacing', label: 'Letter Spacing', type: 'spacing', defaultValue: '0', group: 'Typography' },
  { varName: '--font-weight', label: 'Font Weight', type: 'select', options: ['300', '400', '500', '600', '700', '800', '900'], defaultValue: '400', group: 'Typography' },
  { varName: '--text-align', label: 'Alignment', type: 'select', options: ['left', 'center', 'right', 'justify'], defaultValue: 'left', group: 'Typography' },
  { varName: '--opacity', label: 'Opacity', type: 'slider', min: 0, max: 1, step: 0.01, defaultValue: '1', group: 'Spacing' },
  { varName: '--padding-top', label: 'Top', type: 'spacing', defaultValue: '0', group: 'Padding' },
  { varName: '--padding-right', label: 'Right', type: 'spacing', defaultValue: '0', group: 'Padding' },
  { varName: '--padding-bottom', label: 'Bottom', type: 'spacing', defaultValue: '0', group: 'Padding' },
  { varName: '--padding-left', label: 'Left', type: 'spacing', defaultValue: '0', group: 'Padding' },
  { varName: '--border-radius', label: 'Border Radius', type: 'size', defaultValue: '0', group: 'Border' },
  { varName: '--z-index', label: 'Z-Index', type: 'size', defaultValue: 'auto', group: 'Border' },
];

export const FONT_OPTIONS = [
  'sans-serif', 'serif', 'monospace',
  'Arial', 'Helvetica', 'Georgia', 'Times New Roman',
  'Verdana', 'Trebuchet MS', 'Courier New',
  'Plus Jakarta Sans', 'Inter', 'Roboto', 'Open Sans',
];
