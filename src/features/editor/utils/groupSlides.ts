import type { ProjectFile } from '@/types/api';

export type SlideGroup = {
  stem: string;
  title: string;
  files: {
    slide?: ProjectFile;
    style?: ProjectFile;
    content?: ProjectFile;
  };
  order: number;
};

/**
 * Pick the best display title for a slide. Preference order:
 *   1. The first `<h1|h2|h3 data-field="title">` text content inside
 *      the slide HTML (semantic, what the user actually typed).
 *   2. The slide stem as a fallback (e.g. `slide-cover`).
 *
 * Returning the stem rather than an empty string keeps the
 * library list populated even for unannotated slides.
 */
export function extractSlideTitle(slideHtml: string | null | undefined, stem: string): string {
  if (!slideHtml) return stem;
  // Match the first heading whose data-field is exactly "title".
  // We don't try to be clever about attribute order — both
  // `<h2 data-field="title">` and `<h2 class="x" data-field="title">`
  // are common in seeded projects.
  const match = slideHtml.match(/<h[1-3][^>]*\bdata-field=["']title["'][^>]*>([\s\S]*?)<\/h[1-3]>/i);
  if (match) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text) return text;
  }
  return stem;
}

/**
 * Convert a user-authored title (e.g. `"My Title"`) into a stable,
 * filesystem-safe stem fragment. The caller is responsible for
 * prefixing the result with `slide-NN-`.
 *
 * Rules:
 *   - Lowercase.
 *   - Replace any character that isn't ASCII alphanumeric or
 *     whitespace with nothing.
 *   - Collapse whitespace runs to a single `-`.
 *   - Strip leading/trailing dashes so the final stem never reads
 *     `slide-11--foo`.
 */
export function titleToStemFragment(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip combining marks
    .replace(/[^a-z0-9\s]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function groupSlides(files: ProjectFile[]): SlideGroup[] {
  // Only `slide` layer files are slides. Shared project files (style.css,
  // data.json, etc.) live on their own layers and must not appear in the
  // slide library.
  const slideLayers = new Set(['slide']);
  const relevant = files.filter((f) => slideLayers.has(f.layer));
  const grouped = new Map<string, SlideGroup>();

  for (const file of relevant) {
    const stem = file.name.replace(/\.[^.]+$/, '');
    let group = grouped.get(stem);
    if (!group) {
      group = {
        stem,
        title: '',
        files: {},
        order: file.sort_order,
      };
      grouped.set(stem, group);
    }
    group.files[file.layer as 'slide' | 'style' | 'content'] = file;
    group.order = Math.min(group.order, file.sort_order);
  }

  const groups = Array.from(grouped.values());

  for (const g of groups) {
    g.title = extractSlideTitle(g.files.slide?.content, g.stem);
  }

  return groups.sort((a, b) => a.order - b.order);
}
