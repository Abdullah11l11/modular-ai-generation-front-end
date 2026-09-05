import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScaledIframe } from '@/features/editor/components/Preview/ScaledIframe';
import { assemblePreviewHtml } from '@/features/editor/hooks/useAssemblePreview';
import { groupSlides } from '@/features/editor/utils/groupSlides';
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

/**
 * Reactive preview of the template's slides. Single-slide templates
 * render a plain 16:9 preview; multi-slide templates become a slider
 * with prev/next arrows on either side and a `Slide N of M` counter
 * below the frame.
 */
export function TemplatePreviewPanel({ files, direction, isLoading }: TemplatePreviewPanelProps) {
  const slides = useMemo(() => groupSlides(files ?? []), [files]);
  const [slideIndex, setSlideIndex] = useState(0);

  // Return to the first slide whenever a different template's files load.
  useEffect(() => {
    setSlideIndex(0);
  }, [files]);

  const totalSlides = slides.length;
  const safeIndex = Math.min(Math.max(slideIndex, 0), Math.max(totalSlides - 1, 0));
  const slideFile = slides[safeIndex]?.files.slide;
  const styleFile = files ? findFirstByLayer(files, 'style') : undefined;
  const layoutFile = files ? findFirstByLayer(files, 'layout') : undefined;
  const contentFile = files ? findFirstByLayer(files, 'content') : undefined;

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

  const goPrev = useCallback(() => {
    setSlideIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setSlideIndex((i) => Math.min(totalSlides - 1, i + 1));
  }, [totalSlides]);

  if (isLoading) {
    return <Skeleton className="aspect-video w-full rounded-xl" />;
  }

  if (totalSlides === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border-2 border-dashed border-[var(--bor)] bg-[var(--sur)] text-sm text-[var(--t3)]">
        No preview available — this template has no slide file.
      </div>
    );
  }

  const isSlider = totalSlides > 1;

  return (
    <div className={isSlider ? 'flex items-center gap-3' : ''}>
      {isSlider ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={goPrev}
          disabled={slideIndex <= 0}
          aria-label="Previous slide"
          className="shrink-0"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
      ) : null}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="aspect-video w-full">
          <ScaledIframe
            srcDoc={srcDoc}
            naturalWidth={1280}
            naturalHeight={720}
            title="Template preview"
            className="rounded-xl border border-[var(--bor)] bg-white"
          />
        </div>
        {isSlider ? (
          <p className="text-center text-xs text-[var(--t3)]">
            Slide {safeIndex + 1} of {totalSlides}
          </p>
        ) : null}
      </div>
      {isSlider ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={goNext}
          disabled={slideIndex >= totalSlides - 1}
          aria-label="Next slide"
          className="shrink-0"
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}