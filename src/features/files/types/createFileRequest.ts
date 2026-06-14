import type { ProjectFileKind } from '@/types/api';

export type CreateFileRequest = {
  layer: ProjectFileKind;
  name: string;
  extension: string;
  sort_order?: number;
  content?: string | null;
};
