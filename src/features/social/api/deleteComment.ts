import { apiClient } from '@/lib/api/client';
import type { Id } from '@/types/api';

export const deleteComment = (commentId: Id) => apiClient.delete(`comments/${commentId}`);
