import type { OutputTypeInfo, ProjectTypeSize } from './outputType';
import type { ProjectFile } from '@/types/api';

/**
 * Source-of-truth mapping produced from the project-types spec
 * (docs/superpowers/specs/2026-08-29-mgf-project-types-design.md §3).
 *
 * Keyed by the `name` (slug) of the `OutputType` returned by `GET /types`.
 * Frontend-only — no backend or API contract change.
 */
export const OUTPUT_TYPE_INFO: Record<string, OutputTypeInfo> = {
  presentation: {
    slug: 'presentation',
    name: 'Presentation',
    archetype: 'deck',
    defaultSize: '16:9',
    allowedSizes: ['16:9', '3:4'],
    exportHints: ['PDF', 'PPTX', 'PNG sequence', 'HTML', 'ZIP'],
  },
  carousel: {
    slug: 'carousel',
    name: 'Carousel',
    archetype: 'deck',
    defaultSize: 'full',
    allowedSizes: ['full', 'square'],
    exportHints: ['PNG sequence', 'HTML', 'ZIP'],
  },
  poster: {
    slug: 'poster',
    name: 'Poster',
    archetype: 'single',
    defaultSize: '3:4',
    allowedSizes: ['3:4', 'square'],
    exportHints: ['PNG', 'HTML', 'ZIP'],
  },
  website: {
    slug: 'website',
    name: 'Website / Landing Page',
    archetype: 'website',
    defaultSize: 'full',
    allowedSizes: ['full'],
    exportHints: ['HTML', 'ZIP'],
  },
  'landing-page': {
    slug: 'landing-page',
    name: 'Website / Landing Page',
    archetype: 'website',
    defaultSize: 'full',
    allowedSizes: ['full'],
    exportHints: ['HTML', 'ZIP'],
  },
  infographic: {
    slug: 'infographic',
    name: 'Infographic',
    archetype: 'website',
    defaultSize: 'full',
    allowedSizes: ['full'],
    exportHints: ['PNG', 'PDF', 'HTML'],
  },
  document: {
    slug: 'document',
    name: 'Document',
    archetype: 'website',
    defaultSize: 'a4',
    allowedSizes: ['a4'],
    exportHints: ['PDF', 'HTML'],
  },
};

const FALLBACK: OutputTypeInfo = {
  slug: 'unknown',
  name: 'General',
  archetype: 'deck',
  defaultSize: 'full',
  allowedSizes: ['full'],
  exportHints: ['HTML', 'ZIP'],
};

/** Resolve full info for a catalogue type name (slug). Unknown types fall back gracefully. */
export function getOutputTypeInfo(slug: string | undefined): OutputTypeInfo {
  if (!slug) return FALLBACK;
  return OUTPUT_TYPE_INFO[slug] ?? FALLBACK;
}

/** Resolve full info from a catalogue `OutputType` object, keyed by its `name`. */
export function resolveOutputType(type: { name: string } | undefined): OutputTypeInfo {
  return type ? getOutputTypeInfo(type.name) : FALLBACK;
}

/**
 * The concrete sizes a type can be displayed at (used by `SizeSelector`).
 * A single-element or `full`-only envelope means no selector is shown.
 */
export function isMultiSize(allowedSizes: ProjectTypeSize[]): boolean {
  return allowedSizes.length > 1;
}

/**
 * Natural pixel dimensions used to scale the editor preview iframe for
 * each size. `full` falls back to the 16:9 deck canvas (1280×720) —
 * the reference the MGF `layout.css` is built around.
 */
export const SIZE_NATURAL_DIMENSIONS: Record<ProjectTypeSize, { width: number; height: number }> = {
  '16:9': { width: 1280, height: 720 },
  '3:4': { width: 720, height: 960 },
  square: { width: 720, height: 720 },
  a4: { width: 794, height: 1123 },
  full: { width: 1280, height: 720 },
};

const SIZE_VALUES = new Set<ProjectTypeSize>(
  Object.keys(SIZE_NATURAL_DIMENSIONS) as ProjectTypeSize[],
);

function isProjectTypeSize(value: unknown): value is ProjectTypeSize {
  return typeof value === 'string' && SIZE_VALUES.has(value as ProjectTypeSize);
}

/**
 * Read the persisted project size from the `meta` file layer (meta.json).
 * Returns `null` when the project has no meta file or no recognized size —
 * callers fall back to the type's default size.
 */
export function readProjectSize(files: ProjectFile[]): ProjectTypeSize | null {
  const meta = files.find((f) => f.layer === 'meta' && f.name === 'meta.json');
  if (!meta?.content) return null;
  try {
    const data = JSON.parse(meta.content) as { size?: unknown };
    return isProjectTypeSize(data.size) ? data.size : null;
  } catch {
    return null;
  }
}

/** Natural dimensions for a size, falling back to the 16:9 reference when unknown. */
export function naturalDimensionsForSize(
  size: ProjectTypeSize | null | undefined,
): { width: number; height: number } {
  return size ? SIZE_NATURAL_DIMENSIONS[size] : SIZE_NATURAL_DIMENSIONS['16:9'];
}
