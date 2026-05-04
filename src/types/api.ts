export type Id = string

export type PaginatedResponse<T> = {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
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

export type ProjectFileKind =
  | 'content'
  | 'sequence'
  | 'slide'
  | 'style'
  | 'layout'
  | 'context'
  | 'rules'
  | 'meta'

export type ProjectFile = {
  id: Id
  owner_type: 'template' | 'project'
  owner_id: Id
  kind: ProjectFileKind
  path: string
  content: string
  created_at: string
  updated_at: string
}

export type AiJob = {
  id: Id
  project_id: Id
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  target: 'project' | 'file'
  file_id?: Id | null
  error?: string | null
  created_at: string
  updated_at: string
}

export type ExportJob = {
  id: Id
  project_id: Id
  status: 'queued' | 'running' | 'ready' | 'failed'
  format: 'html' | 'pdf' | 'png' | 'jpg' | 'zip' | 'md' | 'pptx'
  download_url: string | null
  created_at: string
  updated_at: string
}

export type ResourceKind =
  | 'prompt'
  | 'skill'
  | 'agent'
  | 'rule'
  | 'mcp'
  | 'design_doc'
  | 'hook'

export type Resource = {
  id: Id
  user_id: Id
  author?: UserSummary
  kind: ResourceKind
  name: string
  description: string | null
  body: string
  visibility: Visibility
  tags: string[]
  fork_count: number
  upvote_count: number
  is_upvoted: boolean
  is_bookmarked: boolean
  created_at: string
  updated_at: string
}

export type Comment = {
  id: Id
  user_id: Id
  author?: UserSummary
  body: string
  created_at: string
  updated_at: string
}

export type ToggleResponse = {
  active: boolean
  count: number
}
