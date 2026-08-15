import type { CreateFileRequest } from '@/features/files/types/createFileRequest'
import { apiClient } from '@/lib/api/client'
import type { Id, ProjectFile } from '@/types/api'

export const createProjectFile = (
  projectId: Id,
  payload: CreateFileRequest,
) =>
  apiClient.post<ProjectFile, CreateFileRequest>(
    `projects/${projectId}/files`,
    payload,
  )
// import { apiClient } from '@/lib/api/client';
// import type { CreateProjectFileRequest } from '@/features/files/types/createProjectFileRequest';
// import type { ProjectFile } from '@/features/files/types/projectFile';

// export async function createProjectFile(
//   projectId: string,
//   payload: CreateProjectFileRequest,
// ): Promise<ProjectFile> {
//   const response = await apiClient.post<ProjectFile>(
//     `/projects/${projectId}/files`,
//     payload,
//   );

//   return response;
// }