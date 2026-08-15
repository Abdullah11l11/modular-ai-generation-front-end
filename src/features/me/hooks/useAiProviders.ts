import { useQuery } from '@tanstack/react-query';
import { listAiProviders } from '@/features/me/api/listAiProviders';

export const useAiProviders = () =>
  useQuery({
    queryKey: ['me', 'ai-providers'],
    queryFn: listAiProviders,
  });
