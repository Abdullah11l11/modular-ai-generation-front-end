import type { ResourceKind, Visibility } from '@/types/api';

export type CreateResourceRequest = {
  kind: ResourceKind;
  name: string;
  description?: string | null;
  content: string;
  visibility?: Visibility;
  tags?: string[];
};
