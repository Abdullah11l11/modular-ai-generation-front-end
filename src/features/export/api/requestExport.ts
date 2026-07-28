import type { ExportRequest } from '@/features/export/types/exportRequest'
import { apiClient } from '@/lib/api/client'
import type { ExportJob, Id } from '@/types/api'

export const requestExport = (projectId: Id, payload: ExportRequest) =>
  apiClient.post<ExportJob, ExportRequest>(
    `projects/${projectId}/export`,
    payload,
  )
