import type { ExportFormat } from './exportFormat';

export type ExportJobStatus =
  | 'pending'
  | 'processing'
  | 'ready'
  | 'failed';

export interface ExportJob {
  id: string;
  project_id: string;
  format: ExportFormat;
  status: ExportJobStatus;
  download_url: string | null;
  expires_at: string | null;
  error_message: string | null;
  created_at: string;
}