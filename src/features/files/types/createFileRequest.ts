import type { FileLayer } from '@/types/api'

export type CreateFileRequest = {
  layer: FileLayer
  name: string
  extension: string
  sort_order?: number
  content?: string | null
}
