import type { ResourceKind } from '@/types/api'

export type ResourceListParams = {
  page?: number
  per_page?: number
  kind?: ResourceKind
  q?: string
  tags?: string
  sort?: 'popular' | 'newest' | 'most_forked'
}
