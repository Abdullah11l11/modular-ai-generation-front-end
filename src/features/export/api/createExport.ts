import { apiClient } from '@/lib/api/client';
import type { ExportJob } from '../types/exportJob';
import type { ExportRequest } from '../types/exportRequest';

export async function createExport(
  projectId: string,
  request: ExportRequest,
): Promise<ExportJob> {
  const response = await apiClient.post<ExportJob>(
    `/projects/${projectId}/export`,
    request,
  );

  return response;
}