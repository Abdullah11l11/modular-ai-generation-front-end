import type { SocialTarget } from '@/features/social/types/socialTarget';

export interface CommentAuthor {
  id: string;
  name: string;
  avatar_url: string | null;
}

export interface Comment {
  id: string;
  user_id: string;
  author: CommentAuthor;

  target_id: string;
  target_type: SocialTarget ;

  parent_id: string | null;

  body: string;

  replies: Comment[];

  created_at: string;
  updated_at: string;
}