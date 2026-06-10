import { useMutation } from '@tanstack/react-query';
import { requestExport } from '@/features/export/api/requestExport';
import type { ExportRequest } from '@/features/export/types/exportRequest';
import type { Id } from '@/types/api';

export const useRequestExport = () =>
  useMutation({
    mutationFn: ({ projectId, payload }: { projectId: Id; payload: ExportRequest }) =>
      requestExport(projectId, payload),
  });
