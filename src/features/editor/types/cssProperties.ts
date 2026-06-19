export type CssPropertyType =
  | 'color'
  | 'font'
  | 'string'
  | 'size'
  | 'select'
  | 'slider'
  | 'padding';

export type CssPropertyDef = {
  varName: string;
  label: string;
  type: CssPropertyType;
  defaultValue: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
};

export type CssPropertyGroup = {
  title: string;
  fileLayer: 'style' | 'layout' | 'slide';
  properties: CssPropertyDef[];
};

const COMMON_FONTS = [
  'Inter', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman',
  'sans-serif', 'serif', 'monospace',
];

export const THEME_PROPERTIES: CssPropertyGroup = {
  title: 'Theme',
  fileLayer: 'style',
  properties: [
    { varName: '--primary-color', label: 'Primary', type: 'color', defaultValue: '#3b82f6' },
    { varName: '--secondary-color', label: 'Secondary', type: 'color', defaultValue: '#8b5cf6' },
    { varName: '--accent-color', label: 'Accent', type: 'color', defaultValue: '#06b6d4' },
    { varName: '--bg-color', label: 'Background', type: 'color', defaultValue: '#ffffff' },
    { varName: '--text-color', label: 'Text', type: 'color', defaultValue: '#1f2937' },
    { varName: '--border-color', label: 'Border', type: 'color', defaultValue: '#e5e7eb' },
    { varName: '--body-font', label: 'Body Font', type: 'font', defaultValue: 'Inter', options: COMMON_FONTS },
    { varName: '--heading-font', label: 'Heading Font', type: 'font', defaultValue: 'Inter', options: COMMON_FONTS },
  ],
};

export const CONTENT_PROPERTIES: CssPropertyGroup = {
  title: 'Content',
  fileLayer: 'slide',
  properties: [
    { varName: '--title-size', label: 'Title Size', type: 'size', defaultValue: '2rem', min: 0.5, max: 6, step: 0.1 },
    { varName: '--title-weight', label: 'Title Weight', type: 'select', defaultValue: 'bold', options: ['normal', 'bold', '600', '700', '800'] },
    { varName: '--title-color', label: 'Title Color', type: 'color', defaultValue: '#111827' },
    { varName: '--subtitle-size', label: 'Subtitle Size', type: 'size', defaultValue: '1.25rem', min: 0.5, max: 4, step: 0.1 },
    { varName: '--subtitle-weight', label: 'Subtitle Weight', type: 'select', defaultValue: 'normal', options: ['normal', '500', '600', 'bold'] },
    { varName: '--subtitle-color', label: 'Subtitle Color', type: 'color', defaultValue: '#4b5563' },
    { varName: '--body-size', label: 'Body Size', type: 'size', defaultValue: '1rem', min: 0.5, max: 3, step: 0.1 },
    { varName: '--body-weight', label: 'Body Weight', type: 'select', defaultValue: 'normal', options: ['normal', '300', '400', '500', '600'] },
    { varName: '--body-color', label: 'Body Color', type: 'color', defaultValue: '#374151' },
    { varName: '--text-align', label: 'Text Align', type: 'select', defaultValue: 'left', options: ['left', 'center', 'right', 'justify'] },
  ],
};

export const STYLE_PROPERTIES: CssPropertyGroup = {
  title: 'Style',
  fileLayer: 'layout',
  properties: [
    { varName: '--font-size', label: 'Font Size', type: 'size', defaultValue: '1rem', min: 0.5, max: 4, step: 0.1 },
    { varName: '--line-height', label: 'Line Height', type: 'select', defaultValue: '1.5', options: ['1', '1.25', '1.5', '1.75', '2'] },
    { varName: '--letter-spacing', label: 'Letter Spacing', type: 'size', defaultValue: '0', min: -0.1, max: 0.5, step: 0.01 },
    { varName: '--font-weight', label: 'Font Weight', type: 'select', defaultValue: 'normal', options: ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold'] },
    { varName: '--text-align', label: 'Alignment', type: 'select', defaultValue: 'left', options: ['left', 'center', 'right', 'justify'] },
    { varName: '--opacity', label: 'Opacity', type: 'slider', defaultValue: '1', min: 0, max: 1, step: 0.05 },
    { varName: '--padding-top', label: 'Padding Top', type: 'size', defaultValue: '0', min: 0, max: 8, step: 0.25 },
    { varName: '--padding-right', label: 'Padding Right', type: 'size', defaultValue: '0', min: 0, max: 8, step: 0.25 },
    { varName: '--padding-bottom', label: 'Padding Bottom', type: 'size', defaultValue: '0', min: 0, max: 8, step: 0.25 },
    { varName: '--padding-left', label: 'Padding Left', type: 'size', defaultValue: '0', min: 0, max: 8, step: 0.25 },
    { varName: '--border-radius', label: 'Border Radius', type: 'size', defaultValue: '0', min: 0, max: 4, step: 0.25 },
    { varName: '--z-index', label: 'Z-Index', type: 'select', defaultValue: 'auto', options: ['auto', '1', '10', '100', '1000'] },
  ],
};
