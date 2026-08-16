import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reorderProjectFiles } from '@/features/files/api/reorderProjectFiles';

import type { ProjectFile } from '@/features/files/types/projectFile';

export function useReorderProjectFiles(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: ProjectFile[]) =>
      reorderProjectFiles(projectId, {
        order: files.map((file) => file.id),
      }),

    onSuccess: (files) => {
      queryClient.setQueryData(['project-files', projectId], files);
    },
  });
}
