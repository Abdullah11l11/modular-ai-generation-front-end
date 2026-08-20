import { apiClient } from '@/lib/api/client';
import type { Id, ProjectFile } from '@/types/api';

type FilesListResponse = {
  data: ProjectFile[];
};

export const listTemplateFiles = (templateId: Id) =>
  apiClient.get<FilesListResponse>(`templates/${templateId}/files`);
