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
    g.title = g.stem;
  }

  return groups.sort((a, b) => a.order - b.order);
}
