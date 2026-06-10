import { apiClient } from '@/lib/api/client';
import type { AiJob, Id, PaginatedResponse } from '@/types/api';

export const listGenerationJobs = (projectId: Id) =>
  apiClient.get<PaginatedResponse<AiJob>>(`projects/${projectId}/jobs`);
