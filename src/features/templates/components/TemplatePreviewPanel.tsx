import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScaledIframe } from '@/features/editor/components/Preview/ScaledIframe';
import { assemblePreviewHtml } from '@/features/editor/hooks/useAssemblePreview';
import type { Direction, ProjectFile } from '@/types/api';

type TemplatePreviewPanelProps = {
  files: ProjectFile[] | undefined;
  direction: Direction;
  isLoading?: boolean;
};

function findFirstByLayer(files: ProjectFile[], layer: ProjectFile['layer']): ProjectFile | undefined {
  return files
    .filter((f) => f.layer === layer)
    .sort((a, b) => a.sort_order - b.sort_order)[0];
}

export function TemplatePreviewPanel({ files, direction, isLoading }: TemplatePreviewPanelProps) {
  const slideFile = files ? findFirstByLayer(files, 'slide') : undefined;
  const totalSlides = files ? files.filter((f) => f.layer === 'slide').length : 0;

  const srcDoc = useMemo(() => {
    if (!files) return '';
    const styleFile = findFirstByLayer(files, 'style');
    const layoutFile = findFirstByLayer(files, 'layout');
    const contentFile = findFirstByLayer(files, 'content');
    return assemblePreviewHtml({
      slideHtml: slideFile?.content ?? '',
      slideCss: '',
      layoutCss: layoutFile?.content ?? '',
      layoutHtml: '',
      styleCss: styleFile?.content ?? '',
      contentJson: contentFile?.content ?? '{}',
      direction,
    });
  }, [files, slideFile, direction]);

  if (isLoading) {
    return <Skeleton className="aspect-video w-full rounded-xl" />;
  }

  if (!slideFile) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border-2 border-dashed border-[var(--bor)] bg-[var(--sur)] text-sm text-[var(--t3)]">
        No preview available — this template has no slide file.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ScaledIframe
        srcDoc={srcDoc}
        naturalWidth={1280}
        naturalHeight={720}
        title="Template preview"
        className="rounded-xl border border-[var(--bor)] bg-white"
      />
      {totalSlides > 1 ? (
        <p className="text-xs text-[var(--t3)]">
          Slide 1 of {totalSlides} · showing first only
        </p>
      ) : null}
    </div>
  );
}
