import type { CreateProjectFileRequest } from '@/features/files/types/createProjectFileRequest';
import { apiClient } from '@/lib/api/client';
import type { Id, ProjectFile } from '@/types/api';

export const createProjectFile = (projectId: Id, payload: CreateProjectFileRequest) =>
  apiClient.post<ProjectFile, CreateProjectFileRequest>(`projects/${projectId}/files`, payload);
