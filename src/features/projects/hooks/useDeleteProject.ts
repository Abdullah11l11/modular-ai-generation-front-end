import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProject } from '@/features/projects/api/deleteProject';
import type { Id, PaginatedResponse, Project } from '@/types/api';
import { toastSuccess, toastError } from '@/lib/toast';

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: Id) => deleteProject(projectId),

    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      const previousQueries = queryClient.getQueriesData<PaginatedResponse<Project>>({ queryKey: ['projects'] });

      queryClient.setQueriesData<PaginatedResponse<Project>>(
        { queryKey: ['projects'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((p) => p.id !== projectId),
            meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
          };
        },
      );

      return { previousQueries };
    },

    onError: (_err, _projectId, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
      toastError('Failed to delete project. Please try again.');
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toastSuccess('Project deleted');
    },
  });
};
