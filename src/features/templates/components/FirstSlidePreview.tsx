import { useMemo } from 'react';
import { assemblePreviewHtml } from '@/features/editor/hooks/useAssemblePreview';
import type { Direction, ProjectFile } from '@/types/api';

type FirstSlidePreviewProps = {
  files: ProjectFile[] | undefined;
  direction: Direction;
  isLoading: boolean;
};

function firstByLayer(files: ProjectFile[], layer: ProjectFile['layer']) {
  return files
    .filter((f) => f.layer === layer)
    .sort((a, b) => a.sort_order - b.sort_order)[0];
}

/**
 * Passive thumbnail: assembles the first slide + style + layout + content
 * (the same recipe TemplatePreviewPanel uses) and renders it inside a
 * sandboxed iframe with `pointer-events-none` so the card's click target
 * still works. `sandbox=""` is intentional — a static preview does not
 * need scripts.
 *
 * Used by both TemplateCard (browse) and ProjectCard (dashboard) since
 * the underlying file shape (ProjectFile[]) and recipe are identical.
 */
export function FirstSlidePreview({ files, direction, isLoading }: FirstSlidePreviewProps) {
  const slideFile = files ? firstByLayer(files, 'slide') : undefined;
  const styleFile = files ? firstByLayer(files, 'style') : undefined;
  const layoutFile = files ? firstByLayer(files, 'layout') : undefined;
  const contentFile = files ? firstByLayer(files, 'content') : undefined;

  const srcDoc = useMemo(() => {
    if (!slideFile) return '';
    return assemblePreviewHtml({
      slideHtml: slideFile.content ?? '',
      slideCss: '',
      layoutCss: layoutFile?.content ?? '',
      layoutHtml: '',
      styleCss: styleFile?.content ?? '',
      contentJson: contentFile?.content ?? '{}',
      direction,
    });
  }, [slideFile, styleFile, layoutFile, contentFile, direction]);

  if (isLoading) {
    return <div className="aspect-16/10 w-full bg-(--sur2) animate-pulse" />;
  }

  if (!slideFile) {
    return (
      <div className="flex aspect-16/10 w-full items-center justify-center bg-(--sur2) text-(--cy)">
        <span className="text-3xl font-extrabold tracking-tight opacity-30">—</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-16/10 w-full overflow-hidden bg-(--sur2)">
      <iframe
        title="First slide preview"
        srcDoc={srcDoc}
        sandbox=""
        className="pointer-events-none absolute left-0 top-0 h-[1000%] w-[1000%] origin-top-left scale-[0.1]"
      />
    </div>
  );
}
