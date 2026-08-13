import { useMutation } from '@tanstack/react-query';
import { updateUserRole } from '@/features/admin/api/updateUserRole';
import type { Id, User } from '@/types/api';

export const useUpdateUserRole = () =>
  useMutation({
    mutationFn: ({ userId, role }: { userId: Id; role: User['role'] }) =>
      updateUserRole(userId, role),
  });
