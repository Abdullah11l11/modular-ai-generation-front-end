import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTemplate } from '@/features/templates/api/deleteTemplate';
import type { Id } from '@/types/api';
import { toastSuccess, toastError } from '@/lib/toast';

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: Id) => deleteTemplate(templateId),

    onSuccess: (_data, templateId) => {
      // Refresh every list that contains templates so the deleted one
      // disappears everywhere — marketplace, "your templates" tab,
      // author profile grids, related-templates strip.
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.removeQueries({ queryKey: ['templates', templateId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toastSuccess('Template deleted');
    },

    onError: () => {
      toastError('Failed to delete template. Please try again.');
    },
  });
};
