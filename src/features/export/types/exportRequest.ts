import type { ExportFormat } from './exportFormat';
import type { ExportOptions } from './exportOptions';

export interface ExportRequest {
  format: ExportFormat;
  options?: ExportOptions;
}