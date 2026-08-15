import { apiClient } from '@/lib/api/client';
import type { ProjectFile } from '@/features/files/types/projectFile';
import type { ReorderProjectFilesRequest } from '@/features/files/types/reorderProjectFilesRequest';

interface ReorderProjectFilesResponse {
  data: ProjectFile[];
}

export async function reorderProjectFiles(
  projectId: string,
  payload: ReorderProjectFilesRequest,
): Promise<ProjectFile[]> {
  const response = await apiClient.patch<ReorderProjectFilesResponse, ReorderProjectFilesRequest>(
    `/projects/${projectId}/files/reorder`,
    payload,
  );

  return response.data;
}