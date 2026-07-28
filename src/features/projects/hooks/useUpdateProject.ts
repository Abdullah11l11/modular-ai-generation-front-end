import { useMutation } from '@tanstack/react-query'
import { updateProject } from '@/features/projects/api/updateProject'
import type { UpdateProjectRequest } from '@/features/projects/types/updateProjectRequest'
import type { Id } from '@/types/api'

export const useUpdateProject = () =>
  useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: Id
      payload: UpdateProjectRequest
    }) => updateProject(projectId, payload),
  })
