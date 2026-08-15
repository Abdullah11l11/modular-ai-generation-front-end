import { useMutation } from '@tanstack/react-query';
import { createResource } from '@/features/resources/api/createResource';
import type { CreateResourceRequest } from '@/features/resources/types/createResourceRequest';

export const useCreateResource = () =>
  useMutation({
    mutationFn: (payload: CreateResourceRequest) => createResource(payload),
  });
