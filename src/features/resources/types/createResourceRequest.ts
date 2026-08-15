import type { ResourceKind, Visibility } from '@/types/api';

export type CreateResourceRequest = {
  kind: ResourceKind;
  name: string;
  description?: string | null;
  body: string;
  visibility?: Visibility;
  tags?: string[];
};
