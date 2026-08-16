import { useMutation } from '@tanstack/react-query';
import { createExport } from '../api/createExport';
import type { ExportRequest } from '../types/exportRequest';

export function useCreateExport(projectId: string) {
  return useMutation({
    mutationFn: (request: ExportRequest) =>
      createExport(projectId, request),
  });
}