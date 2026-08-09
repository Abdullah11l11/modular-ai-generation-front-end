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

function extractTitle(contentFile: ProjectFile): string {
  if (!contentFile.content) return '';
  try {
    const parsed = JSON.parse(contentFile.content);
    return typeof parsed.title === 'string' ? parsed.title : '';
  } catch {
    return '';
  }
}

export function groupSlides(files: ProjectFile[]): SlideGroup[] {
  const slideLayers = new Set(['slide', 'style', 'content']);
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
    if (g.files.content) {
      g.title = extractTitle(g.files.content) || g.stem;
    } else {
      g.title = g.stem;
    }
  }

  return groups.sort((a, b) => a.order - b.order);
}
