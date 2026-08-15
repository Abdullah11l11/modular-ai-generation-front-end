import { useMutation } from '@tanstack/react-query';
import { createProject } from '@/features/projects/api/createProject';
import type { CreateProjectRequest } from '@/features/projects/types/createProjectRequest';

export const useCreateProject = () =>
  useMutation({
    mutationFn: (payload: CreateProjectRequest) => createProject(payload),
  });
