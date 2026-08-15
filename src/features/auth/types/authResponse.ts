import type { User } from '@/types/api';

export type AuthResponse = {
  token: string;
  user: User;
};
