import { useMutation } from '@tanstack/react-query'
import { generateProject } from '@/features/generation/api/generateProject'
import type { GenerateFullRequest } from '@/features/generation/types/generateFullRequest'
import type { Id } from '@/types/api'

export const useGenerateProject = () =>
  useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: Id
      payload: GenerateFullRequest
    }) => generateProject(projectId, payload),
  })
