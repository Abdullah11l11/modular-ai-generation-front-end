import { useMutation } from '@tanstack/react-query';
import { forkResource } from '@/features/resources/api/forkResource';
import type { ForkResourceRequest } from '@/features/resources/types/forkResourceRequest';
import type { Id } from '@/types/api';

export const useForkResource = () =>
  useMutation({
    mutationFn: ({ resourceId, payload }: { resourceId: Id; payload?: ForkResourceRequest }) =>
      forkResource(resourceId, payload),
  });
