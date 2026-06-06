export type Id = string

export type PaginationLink = {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number | null
    to: number | null
    path: string
    links: PaginationLink[]
  }
}

export type PaginationParams = {
  page?: number
  per_page?: number
}

export type Visibility = 'public' | 'private' | 'unlisted'
export type Direction = 'ltr' | 'rtl'

export type UserProfile = {
  bio: string | null
  avatar_url: string | null
  website: string | null
  location: string | null
}

export type User = {
  id: Id
  name: string
  email: string
  role: 'user' | 'admin'
  profile?: UserProfile
  created_at: string
}

export type UserSummary = Pick<User, 'id' | 'name'> & {
  avatar_url?: string | null
}

export type OutputType = {
  id: Id
  name: string
  description: string
  icon: string
}

export type Template = {
  id: Id
  user_id: Id
  author?: UserSummary
  type?: OutputType
  name: string
  description: string | null
  thumbnail_url: string | null
  visibility: Visibility
  tags: string[]
  locale: string
  direction: Direction
  fork_count: number
  upvote_count: number
  is_upvoted: boolean
  is_bookmarked: boolean
  created_at: string
  updated_at: string
}

export type Project = {
  id: Id
  user_id: Id
  template_id: Id | null
  type?: OutputType
  origin_template_name: string | null
  name: string
  description: string | null
  status: 'draft' | 'published' | 'archived'
  visibility: Visibility
  tags: string[]
  locale: string
  direction: Direction
  cloned_at: string | null
  created_at: string
  updated_at: string
}

export type FileLayer =
  | 'slide'
  | 'style'
  | 'layout'
  | 'content'
  | 'context'
  | 'rules'
  | 'meta'
  | 'asset'

export type ProjectFile = {
  id: Id
  template_id: Id | null
  project_id: Id | null
  layer: FileLayer
  name: string
  extension: string
  sort_order: number
  content: string | null
  storage_url: string | null
  size_bytes: number | null
  created_at: string
  updated_at: string
}

export type AiJob = {
  id: Id
  project_id: Id | null
  template_id: Id | null
  file_id: Id | null
  provider_id: Id | null
  provider: string
  model: string
  layer: string | null
  status: 'pending' | 'running' | 'success' | 'failed'
  error_message: string | null
  tokens_used: number | null
  duration_ms: number | null
  created_at: string
  completed_at: string | null
}

export type ExportJob = {
  id: Id
  project_id: Id
  format: 'html' | 'pdf' | 'png' | 'jpg' | 'pptx' | 'zip' | 'md'
  status: 'pending' | 'processing' | 'ready' | 'failed'
  download_url: string | null
  expires_at: string | null
  error_message: string | null
  created_at: string
}

export type ResourceKind =
  | 'prompt'
  | 'skill'
  | 'agent'
  | 'rule'
  | 'mcp'
  | 'design_doc'
  | 'hook'

export type Placeholder = {
  key: string
  label: string
  default: string
  type: 'text' | 'textarea' | 'select'
}

export type Resource = {
  id: Id
  user_id: Id
  author?: UserSummary
  forked_from_id: Id | null
  kind: ResourceKind
  name: string
  description: string | null
  content: string
  placeholders: Placeholder[] | null
  visibility: Visibility
  tags: string[]
  upvote_count: number
  fork_count: number
  is_upvoted: boolean
  is_bookmarked: boolean
  created_at: string
  updated_at: string
}

export type Comment = {
  id: Id
  user_id: Id
  author?: UserSummary
  target_id: Id
  target_type: 'template' | 'resource'
  parent_id: Id | null
  body: string
  replies: Comment[]
  created_at: string
  updated_at: string
}

export type UpvoteResponse = {
  upvoted: boolean
  upvote_count: number
}

export type BookmarkResponse = {
  bookmarked: boolean
}
