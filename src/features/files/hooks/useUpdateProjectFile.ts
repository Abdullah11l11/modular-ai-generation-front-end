import { useMutation } from '@tanstack/react-query';
import { updateProjectFile } from '@/features/files/api/updateProjectFile';
import type { UpdateFileRequest } from '@/features/files/types/updateFileRequest';
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
      payload: UpdateFileRequest;
    }) => updateProjectFile(projectId, fileId, payload),
  });
