import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject } from '@/features/projects/api/createProject';
import type { CreateProjectRequest } from '@/features/projects/types/createProjectRequest';

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectRequest) => createProject(payload),
    onSuccess: () => {
      // Refresh every place that lists projects so the new one shows
      // up immediately — dashboard, user profile pages, and any
      // paginated projects list. Without this, the dashboard kept
      // showing the stale list until the next refetch.
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
