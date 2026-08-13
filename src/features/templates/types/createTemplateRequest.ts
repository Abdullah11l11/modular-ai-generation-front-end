import type { Direction, Id, Visibility } from '@/types/api';

export type CreateTemplateRequest = {
  type_id: Id;
  name: string;
  description?: string | null;
  visibility?: Visibility;
  tags?: string[];
  locale?: string;
  direction?: Direction;
};
