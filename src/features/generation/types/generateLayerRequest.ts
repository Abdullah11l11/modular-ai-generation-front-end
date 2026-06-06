import type { Id } from '@/types/api'

export type GenerateLayerRequest = {
  provider_id: Id
  model?: string
  prompt?: string | null
}
