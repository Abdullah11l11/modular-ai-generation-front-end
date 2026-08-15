import { apiClient } from '@/lib/api/client';
import type { Comment } from '../types/comment';
import type { CommentListParams } from '../types/commentListParams';
import type { SocialTarget } from '@/features/social/types/socialTarget';

export interface CommentPaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
  path: string;
  link: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
}

export interface CommentsResponse {
  data: Comment[];
  meta: CommentPaginationMeta;
}

export async function listComments(
  target: SocialTarget,
  targetId: string,
  params: CommentListParams = {},
): Promise<CommentsResponse> {
  const response = await apiClient.get<CommentsResponse>(`/${target}s/${targetId}/comments`, {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 20,
    },
  });

  return response;
}