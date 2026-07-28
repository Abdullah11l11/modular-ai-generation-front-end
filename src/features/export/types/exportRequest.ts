export type ExportOptions = {
  page_size?: 'A4' | 'letter' | 'custom'
  width_px?: number
  height_px?: number
  quality?: number
  slides?: string[]
}

export type ExportRequest = {
  format: 'html' | 'pdf' | 'png' | 'jpg' | 'pptx' | 'zip' | 'md'
  options?: ExportOptions
}
