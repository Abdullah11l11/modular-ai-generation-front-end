import type { ExportFormat } from '@/features/export/types/exportFormat';

export type PageSize = 'A4' | 'letter' | 'custom';

export interface ExportOptions {
  page_size?: PageSize;
  width_px?: number;
  height_px?: number;
  quality?: number;
  slides?: string[];
}

export interface ExportFormValues {
  format: ExportFormat;
  page_size: PageSize;
  width_px?: number;
  height_px?: number;
  quality: number;
  slides: string[];
}