import type { Id } from '@/types/api'

export type TemplateListParams = {
  page?: number
  per_page?: number
  q?: string
  type_id?: Id
  tags?: string
  sort?: 'popular' | 'newest' | 'most_forked'
}
