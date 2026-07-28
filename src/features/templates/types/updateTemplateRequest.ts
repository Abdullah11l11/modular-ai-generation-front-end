import type { CreateTemplateRequest } from '@/features/templates/types/createTemplateRequest'

export type UpdateTemplateRequest = Partial<CreateTemplateRequest> & {
  thumbnail_url?: string | null
}
