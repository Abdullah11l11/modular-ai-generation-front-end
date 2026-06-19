import { useMutation } from '@tanstack/react-query';
import { reorderFiles } from '@/features/files/api/reorderFiles';
import type { Id } from '@/types/api';

export const useReorderProjectFiles = () =>
  useMutation({
    mutationFn: ({ projectId, order }: { projectId: Id; order: Id[] }) =>
      reorderFiles(projectId, order),
  });
