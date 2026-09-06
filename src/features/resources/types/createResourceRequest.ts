import type { ResourceKind, ResourcePlaceholder, Visibility } from '@/types/api';

export type CreateResourceRequest = {
  kind: ResourceKind;
  name: string;
  description?: string | null;
  content: string;
  placeholders?: ResourcePlaceholder[];
  visibility?: Visibility;
  tags?: string[];
};
