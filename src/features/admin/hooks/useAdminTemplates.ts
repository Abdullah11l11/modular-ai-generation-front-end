import { useQuery } from '@tanstack/react-query';
import { listAdminTemplates } from '@/features/admin/api/listAdminTemplates';

export const useAdminTemplates = () =>
  useQuery({
    queryKey: ['admin', 'templates'],
    queryFn: listAdminTemplates,
  });
