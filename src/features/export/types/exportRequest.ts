import type { ExportJob } from './exportJob';
import type { ExportOptions } from './exportOptions';

export type ExportRequest = {
  format: ExportJob['format'];
  options?: ExportOptions;
};
