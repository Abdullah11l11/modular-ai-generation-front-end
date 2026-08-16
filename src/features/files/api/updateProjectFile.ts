import type { UpdateProjectFileRequest } from '@/features/files/types/updateProjectFileRequest';
import { apiClient } from '@/lib/api/client';
import type { Id, ProjectFile } from '@/types/api';

export const updateProjectFile = (projectId: Id, fileId: Id, payload: UpdateProjectFileRequest) =>
  apiClient.put<ProjectFile, UpdateProjectFileRequest>(`projects/${projectId}/files/${fileId}`, payload);
