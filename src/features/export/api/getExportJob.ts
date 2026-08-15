import { apiClient } from '@/lib/api/client';
import type { Id } from '@/types/api';
import type { ExportJob } from '../types/exportJob';

export const getExportJob = (jobId: Id) =>
  apiClient.get<ExportJob>(`export-jobs/${jobId}`);
