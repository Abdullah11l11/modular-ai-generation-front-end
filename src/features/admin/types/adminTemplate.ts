export interface AdminTemplate {
  id: number;

  title: string;

  author_id: number;

  author_name: string;

  type: string;

  visibility: 'public' | 'private';

  upvotes: number;

  clones: number;

  created_at: string;
}
