import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forkTemplate } from '@/features/templates/api/forkTemplate';
import type { ForkTemplateRequest } from '@/features/templates/types/forkTemplateRequest';
import type { Id } from '@/types/api';

export const useForkTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, payload }: { templateId: Id; payload: ForkTemplateRequest }) =>
      forkTemplate(templateId, payload),
    onSuccess: () => {
      // Refresh gallery + author lists so the new project shows up everywhere.
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      void queryClient.invalidateQueries({ queryKey: ['templates'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
