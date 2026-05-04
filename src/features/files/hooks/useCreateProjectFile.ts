import { useMutation } from '@tanstack/react-query'
import { createProjectFile } from '@/features/files/api/createProjectFile'
import type { CreateFileRequest } from '@/features/files/types/createFileRequest'
import type { Id } from '@/types/api'

export const useCreateProjectFile = () =>
  useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: Id
      payload: CreateFileRequest
    }) => createProjectFile(projectId, payload),
  })
