import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProject } from '@/features/projects/api/deleteProject';
import type { Id } from '@/types/api';
import { toastSuccess, toastError } from '@/lib/toast';

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: Id) => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toastSuccess('Project deleted');
    },
    onError: () => {
      toastError('Failed to delete project. Please try again.');
    },
  });
};
