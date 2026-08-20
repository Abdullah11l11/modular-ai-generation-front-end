import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditorContext } from '@/features/editor/hooks/useEditorStore';
import { groupSlides } from '@/features/editor/utils/groupSlides';
import { isScrollableType } from '@/features/editor/utils/editorMode';
import { assemblePreviewHtml } from '@/features/editor/hooks/useAssemblePreview';
import { ScaledIframe } from '@/features/editor/components/Preview/ScaledIframe';
import type { ProjectFile } from '@/types/api';
import { ChevronLeftIcon, ChevronRightIcon, XIcon, Maximize2Icon } from 'lucide-react';

type FullScreenPreviewProps = {
  files: ProjectFile[];
  onClose: () => void;
};

function findFile(files: ProjectFile[], layer: string, name: string): ProjectFile | undefined {
  return files.find((f) => f.layer === layer && f.name === name);
}

/**
 * Full-screen preview overlay. Behavior adapts to the project type:
 *
 * - **presentation / carousel** (deck): one slide per viewport, ArrowLeft /
 *   ArrowRight / Space advance, slide counter shown.
 * - **website / poster / infographic / document / landing-page** (scrollable):
 *   renders the entire page at full viewport width, no slide chrome, scrolls
 *   naturally like a real website.
 *
 * Esc closes. The click-to-select behavior of the canvas preview is
 * intentionally disabled here so consumers can click links / buttons in
 * the rendered output without firing element-select events.
 */
export function FullScreenPreview({ files, onClose }: FullScreenPreviewProps) {
  const { state } = useEditorContext();
  const scrollable = isScrollableType(state.projectType);
  const slides = useMemo(() => groupSlides(files), [files]);
  const [slideIndex, setSlideIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isPerSlide = state.editorMode === 'per-slide';
  const layoutHtml = findFile(files, 'layout', 'layout.html')?.content ?? '';
  // Inject `layout.css` in both modes — that's where the MGF class
  // rules (`.mgf-card`, `.mgf-grid-*`, `.mgf-deck`, etc.) live.
  const layoutCss = findFile(files, 'layout', 'layout.css')?.content ?? '';
  const styleCss = findFile(files, 'style', 'style.css')?.content ?? '';
  const contentJson =
    findFile(files, 'content', 'data.json')?.content ??
    findFile(files, 'content', 'content.json')?.content ??
    null;

  // Compute the slide HTML for the current preview state.
  const currentSlideHtml = useMemo(() => {
    if (!isPerSlide) {
      return findFile(files, 'slide', 'content.html')?.content ?? '';
    }
    if (slides.length === 0) return '';
    const safeIndex = Math.min(Math.max(slideIndex, 0), slides.length - 1);
    return slides[safeIndex]?.files.slide?.content ?? '';
  }, [files, isPerSlide, slides, slideIndex]);

  // For scrollable types we render every slide concatenated, wrapped in
  // the layout.html template (so the deck layout looks correct).
  const allSlidesHtml = useMemo(() => {
    if (!scrollable) return '';
    return slides.map((s) => s.files.slide?.content ?? '').join('\n');
  }, [scrollable, slides]);

  const html = useMemo(() => {
    if (scrollable) {
      return assemblePreviewHtml({
        slideHtml: allSlidesHtml,
        slideCss: '',
        layoutCss: '',
        layoutHtml,
        styleCss,
        contentJson,
        direction: state.direction,
      });
    }
    return assemblePreviewHtml({
      slideHtml: currentSlideHtml,
      slideCss: '',
      layoutCss,
      layoutHtml,
      styleCss,
      contentJson,
      direction: state.direction,
    });
  }, [
    scrollable,
    allSlidesHtml,
    currentSlideHtml,
    layoutCss,
    layoutHtml,
    styleCss,
    contentJson,
    state.direction,
  ]);

  const goPrev = useCallback(() => {
    setSlideIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setSlideIndex((i) => Math.min(slides.length - 1, i + 1));
  }, [slides.length]);

  // Keyboard nav — only meaningful for deck types.
  useEffect(() => {
    if (scrollable) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setSlideIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setSlideIndex(slides.length - 1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [scrollable, goPrev, goNext, onClose, slides.length]);

  // For scrollable types, only Escape closes.
  useEffect(() => {
    if (!scrollable) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [scrollable, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full-screen preview"
      className="fixed inset-0 z-50 flex flex-col bg-(--sur) text-(--t1)"
    >
      {/* Top bar */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-(--bor2) px-(--space-page-x)">
        <Maximize2Icon className="size-4 text-(--t3)" />
        <span className="text-sm font-medium">
          {scrollable
            ? `${state.projectType || 'Project'} preview`
            : `Slide ${Math.min(slideIndex + 1, slides.length)} / ${slides.length}`}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {!scrollable && (
            <>
              <button
                type="button"
                onClick={goPrev}
                disabled={slideIndex <= 0}
                aria-label="Previous slide"
                className="inline-flex size-8 items-center justify-center rounded-md border border-(--bor2) text-(--t2) transition hover:bg-(--sur-2) disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeftIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={slideIndex >= slides.length - 1}
                aria-label="Next slide"
                className="inline-flex size-8 items-center justify-center rounded-md border border-(--bor2) text-(--t2) transition hover:bg-(--sur-2) disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRightIcon className="size-4" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="inline-flex size-8 items-center justify-center rounded-md border border-(--bor2) text-(--t2) transition hover:bg-(--sur-2)"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        ref={scrollContainerRef}
        className={
          scrollable
            ? 'flex flex-1 overflow-auto'
            : 'flex flex-1 items-center justify-center overflow-hidden bg-black p-6'
        }
      >
        {scrollable ? (
          // Scrollable types render at their natural full-page height.
          // The parent div is `overflow-auto`, so the user scrolls the
          // iframe externally — same as scrolling a real website. We
          // use `h-full w-full` (not `min-h-full`) so the iframe fully
          // fills the flex column container; otherwise the iframe
          // collapses to 0px in a flex layout and nothing renders.
          <iframe
            title="Full-screen preview"
            srcDoc={html}
            sandbox="allow-same-origin allow-scripts allow-popups"
            className="h-full w-full border-0 bg-(--sur)"
            style={{ minHeight: '100vh' }}
          />
        ) : (
          <div className="flex max-h-full max-w-6xl items-center justify-center">
            <ScaledIframe
              srcDoc={html}
              sandbox="allow-same-origin allow-scripts allow-popups"
              title="Full-screen preview"
              className="w-full rounded-lg bg-white shadow-2xl"
            />
          </div>
        )}
      </div>

      {/* Footer hint for deck types */}
      {!scrollable && slides.length > 0 && (
        <div className="flex h-8 shrink-0 items-center justify-center gap-4 border-t border-(--bor2) text-xs text-(--t3)">
          <span>← / → navigate</span>
          <span>Home / End jump</span>
          <span>Esc close</span>
        </div>
      )}
    </div>
  );
}
