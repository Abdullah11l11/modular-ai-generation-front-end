import { useMutation } from '@tanstack/react-query';
import { generateFile } from '@/features/generation/api/generateFile';
import type { GenerateLayerRequest } from '@/features/generation/types/generateLayerRequest';
import type { Id } from '@/types/api';

export const useGenerateFile = () =>
  useMutation({
    mutationFn: ({
      projectId,
      fileId,
      payload,
    }: {
      projectId: Id;
      fileId: Id;
      payload: GenerateLayerRequest;
    }) => generateFile(projectId, fileId, payload),
  });
