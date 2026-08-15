import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProjectFile } from '../api/deleteProjectFile';

export function useDeleteProjectFile(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) =>
      deleteProjectFile(projectId, fileId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-files', projectId],
      });
    },
  });
}