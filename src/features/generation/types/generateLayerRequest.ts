import type { GenerateFullRequest } from '@/features/generation/types/generateFullRequest'

export type GenerateLayerRequest = GenerateFullRequest & {
  layer?: string
}
