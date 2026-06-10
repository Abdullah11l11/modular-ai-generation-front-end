import { apiClient } from '@/lib/api/client';
import type { AiJob, Id } from '@/types/api';

export const getGenerationJob = (jobId: Id) => apiClient.get<AiJob>(`jobs/${jobId}`);
