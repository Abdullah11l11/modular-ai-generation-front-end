import { useMutation } from '@tanstack/react-query';
import { updateProjectFile } from '@/features/files/api/updateProjectFile';
import type { UpdateProjectFileRequest } from '@/features/files/types/updateProjectFileRequest';
import type { Id } from '@/types/api';

export const useUpdateProjectFile = () =>
  useMutation({
    mutationFn: ({
      projectId,
      fileId,
      payload,
    }: {
      projectId: Id;
      fileId: Id;
      payload: UpdateProjectFileRequest;
    }) => updateProjectFile(projectId, fileId, payload),
  });
