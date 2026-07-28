import type { Id } from '@/types/api'

export type CreateCommentRequest = {
  body: string
  parent_id?: Id | null
}
