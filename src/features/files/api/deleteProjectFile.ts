import { apiClient } from '@/lib/api/client'
import type { Id } from '@/types/api'

export const deleteProjectFile = (projectId: Id, fileId: Id) =>
  apiClient.delete(`projects/${projectId}/files/${fileId}`)
// import { apiClient } from '@/lib/api/client';

// export async function deleteProjectFile(
//   projectId: string,
//   fileId: string,
// ): Promise<void> {
//   await apiClient.delete(
//     `/projects/${projectId}/files/${fileId}`,
//   );
// }