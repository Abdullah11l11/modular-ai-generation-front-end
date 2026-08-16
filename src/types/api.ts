export type Id = string;

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export type PaginationParams = {
  page?: number;
  per_page?: number;
};

export type Visibility = 'public' | 'private' | 'unlisted';
export type Direction = 'ltr' | 'rtl';

export type UserProfile = {
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  location: string | null;
};

export type User = {
  id: Id;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profile?: UserProfile;
  created_at: string;
};

export type UserSummary = Pick<User, 'id' | 'name'> & {
  avatar_url?: string | null;
};

export type OutputType = {
  id: Id;
  name: string;
  description: string;
  icon: string;
};

export type Template = {
  id: Id;
  user_id: Id;
  author?: UserSummary;
  type?: OutputType;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  visibility: Visibility;
  tags: string[];
  locale: string;
  direction: Direction;
  fork_count: number;
  upvote_count: number;
  is_upvoted: boolean;
  is_bookmarked: boolean;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: Id;
  user_id: Id;
  template_id: Id | null;
  type?: OutputType;
  origin_template_name: string | null;
  name: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived';
  visibility: Visibility;
  tags: string[];
  locale: string;
  direction: Direction;
  cloned_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FileLayer =
  | 'slide'
  | 'style'
  | 'layout'
  | 'content'
  | 'context'
  | 'rules'
  | 'meta'
  | 'asset';

export type ProjectFile = {
  id: Id;
  template_id: Id | null;
  project_id: Id | null;
  layer: FileLayer;
  name: string;
  extension: string;
  sort_order: number;
  content: string | null;
  storage_url: string | null;
  size_bytes: number | null;
  created_at: string;
  updated_at: string;
};

export type AiJob = {
  id: Id;
  project_id: Id;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  target: 'project' | 'file';
  file_id?: Id | null;
  error?: string | null;
  created_at: string;
  updated_at: string;
};

export type ExportJob = {
  id: Id;
  project_id: Id;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  format: 'html' | 'pdf' | 'png' | 'jpg' | 'zip' | 'md' | 'pptx';
  download_url: string | null;
  expires_at: string | null;
  created_at: string;
};

export type ResourceKind = 'prompt' | 'skill' | 'agent' | 'rule' | 'mcp' | 'design_doc' | 'hook';

export type ResourcePlaceholder = {
  key: string;
  label: string;
  default: string;
  type: 'text' | 'textarea' | 'select';
};

export type Resource = {
  id: Id;
  user_id: Id;
  author?: UserSummary; // author.name => card
  forked_from_id?: Id | null; //resourceDetail
  kind: ResourceKind; //card
  name: string; //card
  description: string | null; //card
  content: string; //resourceDetail
  placeholders?: ResourcePlaceholder[] | null;  //resourceDetail
  visibility: Visibility;
  tags: string[];
  fork_count: number; //card
  upvote_count: number;  //card
  is_upvoted: boolean; //resourceDetail
  is_bookmarked: boolean; //resourceDetail
  created_at: string; //resourceDetail
  updated_at: string; //resourceDetail
};

export type Comment = {
  id: Id;
  user_id: Id;
  author?: UserSummary;
  content: string;
  created_at: string;
  updated_at: string;
};

export type ToggleResponse = {
  active: boolean;
  count: number;
};
