import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProject } from '@/features/projects/api/updateProject';
import type { UpdateProjectRequest } from '@/features/projects/types/updateProjectRequest';
import type { Id } from '@/types/api';
import { toastSuccess, toastError } from '@/lib/toast';

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: Id; payload: UpdateProjectRequest }) =>
      updateProject(projectId, payload),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      toastSuccess('Project settings saved');
    },
    onError: () => {
      toastError('Failed to save project settings. Please try again.');
    },
  });
};
