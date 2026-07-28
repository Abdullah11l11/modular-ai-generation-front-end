import type { Placeholder, ResourceKind, Visibility } from '@/types/api'

export type CreateResourceRequest = {
  kind: ResourceKind
  name: string
  description?: string | null
  content: string
  placeholders?: Placeholder[]
  visibility?: Visibility
  tags?: string[]
}
