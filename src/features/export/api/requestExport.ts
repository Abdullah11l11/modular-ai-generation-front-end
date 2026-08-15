import type { ExportRequest } from '@/features/export/types/exportRequest';
import { apiClient } from '@/lib/api/client';
import type { Id } from '@/types/api';
import type { ExportJob } from '../types/exportJob';

export const requestExport = (projectId: Id, payload: ExportRequest) =>
  apiClient.post<ExportJob, ExportRequest>(`projects/${projectId}/export`, payload);
