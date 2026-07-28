import type { Id } from '@/types/api'

export type GenerateFullRequest = {
  provider_id: Id
  model?: string
  prompt?: string
}
