import type { Project } from '@/types/api';

export type ProjectListParams = {
  page?: number;
  per_page?: number;
  q?: string;
  status?: Project['status'];
};
