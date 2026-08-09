export type EditorMode = 'per-slide' | 'single-page';

const SINGLE_PAGE_TYPES = new Set(['poster', 'landing-page']);
const PER_SLIDE_TYPES = new Set(['presentation', 'carousel']);

export function getEditorMode(typeName: string | undefined): EditorMode {
  if (!typeName) return 'per-slide';
  if (SINGLE_PAGE_TYPES.has(typeName)) return 'single-page';
  if (PER_SLIDE_TYPES.has(typeName)) return 'per-slide';
  return 'per-slide';
}
