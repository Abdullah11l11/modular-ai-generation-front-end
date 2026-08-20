import { apiClient } from '@/lib/api/client';
import type { Id, ProjectFile } from '@/types/api';

export const reorderFiles = (projectId: Id, order: Id[]) =>
  apiClient.patch<{ data: ProjectFile[] }>(`projects/${projectId}/files/reorder`, { order });
