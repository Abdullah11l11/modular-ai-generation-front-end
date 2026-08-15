import type { UpdateFileRequest } from '@/features/files/types/updateFileRequest';
import { apiClient } from '@/lib/api/client';
import type { Id, ProjectFile } from '@/types/api';

export const updateProjectFile = (projectId: Id, fileId: Id, payload: UpdateFileRequest) =>
  apiClient.put<ProjectFile, UpdateFileRequest>(`projects/${projectId}/files/${fileId}`, payload);
