import type { ExportJob } from '@/types/api'

export type ExportRequest = {
  format: ExportJob['format']
  options?: Record<string, unknown>
}
