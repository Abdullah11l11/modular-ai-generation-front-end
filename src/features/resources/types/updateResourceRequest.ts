import type { Placeholder } from '@/types/api'

export type UpdateResourceRequest = {
  name?: string
  description?: string | null
  content?: string
  placeholders?: Placeholder[]
  visibility?: 'public' | 'private' | 'unlisted'
  tags?: string[]
}
