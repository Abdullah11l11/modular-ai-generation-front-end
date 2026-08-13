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
// import { useMutation, useQueryClient } from '@tanstack/react-query';

// import { createProjectFile } from '../api/createProjectFile';
// import type { CreateProjectFileRequest } from '@/features/files/types/createProjectFileRequest';

// export function useCreateProjectFile(projectId: string) {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (payload: CreateProjectFileRequest) =>
//       createProjectFile(projectId, payload),

//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ['project-files', projectId],
//       });
//     },
//   });
// }