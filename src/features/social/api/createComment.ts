import { apiClient } from '@/lib/api/client';
import type { Comment } from '../types/comment';
import type { CreateCommentRequest } from '../types/createCommentRequest';
import type { SocialTarget } from '@/features/social/types/socialTarget';

export async function createComment(
  target: SocialTarget,
  targetId: string,
  payload: CreateCommentRequest,
): Promise<Comment> {
  const response = await apiClient.post<Comment, CreateCommentRequest>(
    `/${target}s/${targetId}/comments`,
    payload,
  );

  return response;
}