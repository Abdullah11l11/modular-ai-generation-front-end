import type { ProjectFileKind } from '@/types/api'

export type CreateFileRequest = {
  kind: ProjectFileKind
  path: string
  content: string
}
