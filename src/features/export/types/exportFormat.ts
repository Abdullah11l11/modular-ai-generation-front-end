export const EXPORT_FORMATS = [
  'html',
  'pdf',
  'png',
  'jpg',
  'pptx',
  'zip',
  'md',
] as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[number];