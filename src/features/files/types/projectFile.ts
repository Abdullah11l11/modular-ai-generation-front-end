export type FileLayer =
  | 'slide'
  | 'style'
  | 'layout'
  | 'content'
  | 'context'
  | 'rules'
  | 'meta'
  | 'asset';

export interface ProjectFile {
  id: string;
  template_id: string | null;
  project_id: string | null;

  layer: FileLayer;

  name: string;
  extension: string;

  sort_order: number;

  content: string | null;
  storage_url: string | null;

  size_bytes: number | null;

  created_at: string;
  updated_at: string;
}