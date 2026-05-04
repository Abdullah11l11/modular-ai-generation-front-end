import type { Id } from '@/types/api'

export type GenerateFullRequest = {
  prompt?: string
  provider_id?: Id
  model?: string
}
