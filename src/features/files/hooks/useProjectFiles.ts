import { useQuery } from '@tanstack/react-query'
import { listProjectFiles } from '@/features/files/api/listProjectFiles'
import type { Id } from '@/types/api'

export const useProjectFiles = (projectId: Id) =>
  useQuery({
    queryKey: ['projects', projectId, 'files'],
    queryFn: () => listProjectFiles(projectId),
  })
// import { useQuery } from '@tanstack/react-query';
// import { listProjectFiles } from '../api/listProjectFiles';

// export function useProjectFiles(projectId: string) {
//   return useQuery({
//     queryKey: ['project-files', projectId],
//     queryFn: () => listProjectFiles(projectId),
//     enabled: Boolean(projectId),
//   });
// }