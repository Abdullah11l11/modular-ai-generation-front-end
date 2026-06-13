import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject } from '@/features/projects/api/createProject';
import type { CreateProjectRequest } from '@/features/projects/types/createProjectRequest';
import type { Project } from '@/types/api';
import { toastSuccess, toastError } from '@/lib/toast';

export const useDuplicateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: Project) => {
      const payload: CreateProjectRequest = {
        type_id: project.type?.id ?? '',
        name: `${project.name} (copy)`,
        description: project.description,
        visibility: project.visibility,
        tags: project.tags,
        direction: project.direction,
      };
      return createProject(payload);
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toastSuccess(`Project "${newProject.name}" created`);
    },
    onError: () => {
      toastError('Failed to duplicate project. Please try again.');
    },
  });
};
