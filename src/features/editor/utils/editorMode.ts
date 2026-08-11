export type EditorMode = 'per-slide' | 'single-page';

const SINGLE_PAGE_TYPES = new Set([
  'poster',
  'landing-page',
  'website',
  'infographic',
  'document',
]);
const PER_SLIDE_TYPES = new Set(['presentation', 'carousel']);

export function getEditorMode(typeName: string | undefined): EditorMode {
  if (!typeName) return 'per-slide';
  if (SINGLE_PAGE_TYPES.has(typeName)) return 'single-page';
  if (PER_SLIDE_TYPES.has(typeName)) return 'per-slide';
  return 'per-slide';
}

/**
 * Whether the type is meant to be consumed as a scrollable document
 * (a single tall page that the user scrolls through, like a real
 * website). Drives the full-screen preview behavior — presentations
 * paginate slide-by-slide, scrollable types do not.
 */
export function isScrollableType(typeName: string | undefined): boolean {
  if (!typeName) return false;
  // `website` is the canonical scrollable type. Posters/infographics/
  // documents can also be long single pages. Only the deck-style
  // types (presentation, carousel) should paginate.
  return typeName !== 'presentation' && typeName !== 'carousel';
}
