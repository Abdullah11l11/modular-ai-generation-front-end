import { useQuery } from '@tanstack/react-query';
import { listProjectFiles } from '@/features/files/api/listProjectFiles';
import type { Id } from '@/types/api';

export const useProjectFiles = (projectId: Id) =>
  useQuery({
    queryKey: ['projects', projectId, 'files'],
    queryFn: () => listProjectFiles(projectId),
  });
