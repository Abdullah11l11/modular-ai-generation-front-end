import type { GenerateLayerRequest } from '@/features/generation/types/generateLayerRequest';
import { apiClient } from '@/lib/api/client';
import type { AiJob, Id } from '@/types/api';

export const generateFile = (projectId: Id, fileId: Id, payload: GenerateLayerRequest) =>
  apiClient.post<AiJob, GenerateLayerRequest>(
    `projects/${projectId}/files/${fileId}/generate`,
    payload,
  );
