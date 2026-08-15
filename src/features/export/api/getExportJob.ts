import { apiClient } from '@/lib/api/client';
import type { ExportJob } from '../types/exportJob';

export async function getExportJob(
  jobId: string,
): Promise<ExportJob> {
  const response = await apiClient.get<ExportJob>(
    `/export-jobs/${jobId}`,
  );

  return response;
}