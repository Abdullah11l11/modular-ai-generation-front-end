import type { CreateProjectRequest } from '@/features/projects/types/createProjectRequest';
import type { Project } from '@/types/api';

export type UpdateProjectRequest = Partial<CreateProjectRequest> & {
  status?: Project['status'];
};
