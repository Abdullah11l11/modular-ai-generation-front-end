import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteResource } from '@/features/resources/api/deleteResource';
import type { Id } from '@/types/api';

export const useDeleteResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resourceId: Id) => deleteResource(resourceId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['resources'] });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};
