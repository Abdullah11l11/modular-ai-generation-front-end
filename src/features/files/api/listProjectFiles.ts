import { apiClient } from '@/lib/api/client';
import type { Id, ProjectFile } from '@/types/api';

type FilesListResponse = {
  data: ProjectFile[];
};

export const listProjectFiles = (projectId: Id) =>
  apiClient.get<FilesListResponse>(`projects/${projectId}/files`);
