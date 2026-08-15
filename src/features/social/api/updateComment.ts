import { apiClient } from '@/lib/api/client';
import type { Comment } from '../types/comment';

export interface UpdateCommentRequest {
  body: string;
}

export async function updateComment(
  commentId: string,
  payload: UpdateCommentRequest,
): Promise<Comment> {
  const response = await apiClient.put<Comment>(`/comments/${commentId}`, payload);

  return response;
}