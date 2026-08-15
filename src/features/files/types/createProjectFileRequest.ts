import type { FileLayer } from './projectFile';

export interface CreateProjectFileRequest {
  layer: FileLayer;
  name: string;
  extension: string;
  sort_order?: number;
  content?: string | null;
}