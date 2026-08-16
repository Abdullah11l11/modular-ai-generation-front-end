import { useMutation } from '@tanstack/react-query';
import { createProjectFile } from '@/features/files/api/createProjectFile';
import type { CreateProjectFileRequest } from '@/features/files/types/createProjectFileRequest';
import type { Id } from '@/types/api';

export const useCreateProjectFile = () =>
  useMutation({
    mutationFn: ({ projectId, payload }: { projectId: Id; payload: CreateProjectFileRequest }) =>
      createProjectFile(projectId, payload),
  });
