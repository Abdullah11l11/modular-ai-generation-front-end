/**
 * Archetype (layout engine) used to render/preview a project.
 * This is the frontend classification from the project-types feature —
 * it intentionally does not depend on any backend field.
 */
export type ProjectTypeArchetype = 'deck' | 'single' | 'website';

/**
 * Aspect / page size a project is displayed at.
 * `full` means no fixed ratio (scrollable / full page).
 */
export type ProjectTypeSize = '16:9' | '3:4' | 'square' | 'a4' | 'full';

export type ExportFormat = 'PDF' | 'PPTX' | 'PNG' | 'PNG sequence' | 'HTML' | 'ZIP' | 'MD';

export interface OutputTypeInfo {
  /** Matches the `name` (slug) of `OutputType` returned by `GET /types`. */
  slug: string;
  name: string;
  archetype: ProjectTypeArchetype;
  defaultSize: ProjectTypeSize;
  allowedSizes: ProjectTypeSize[];
  exportHints: ExportFormat[];
}
