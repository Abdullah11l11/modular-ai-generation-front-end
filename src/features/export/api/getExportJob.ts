import { apiClient } from '@/lib/api/client'
import type { ExportJob, Id } from '@/types/api'

export const getExportJob = (jobId: Id) =>
  apiClient.get<ExportJob>(`export-jobs/${jobId}`)
