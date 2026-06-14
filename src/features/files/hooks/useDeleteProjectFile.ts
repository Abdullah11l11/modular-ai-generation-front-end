import { useMutation } from '@tanstack/react-query';
import { deleteProjectFile } from '@/features/files/api/deleteProjectFile';
import type { Id } from '@/types/api';

export const useDeleteProjectFile = () =>
  useMutation({
    mutationFn: ({ projectId, fileId }: { projectId: Id; fileId: Id }) =>
      deleteProjectFile(projectId, fileId),
  });
