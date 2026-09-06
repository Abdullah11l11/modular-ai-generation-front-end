import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScaledIframe } from '@/features/editor/components/Preview/ScaledIframe';
import { assemblePreviewHtml } from '@/features/editor/hooks/useAssemblePreview';
import type { Direction, ProjectFile } from '@/types/api';

type SlidePreviewModalProps = {
  /** The slide file to preview. Null when the modal is closed. */
  slideFile: ProjectFile | null;
  /** All files for the template — used to find the matching style, layout,
   *  and content layers that the assembled HTML needs alongside the slide. */
  files: ProjectFile[];
  direction: Direction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Pick the lowest sort_order file in a layer — matches the order used by
 * the side panel and card previews so the rendered slide is consistent
 * with what the user sees elsewhere.
 */
function firstByLayer(allFiles: ProjectFile[], layer: ProjectFile['layer']) {
  return allFiles
    .filter((f) => f.layer === layer)
    .sort((a, b) => a.sort_order - b.sort_order)[0];
}

/**
 * Per-slide modal preview. Composes the same recipe the side panel uses
 * (`assemblePreviewHtml` over slide + style + layout + content) and shows
 * the result in a `ScaledIframe` that fills the dialog at the slide's
 * natural 16:9. Used from the file list — clicking "Preview" on a slide
 * row opens this; clicking "View" still opens the raw-text file viewer.
 */
export function SlidePreviewModal({
  slideFile,
  files,
  direction,
  open,
  onOpenChange,
}: SlidePreviewModalProps) {
  const styleFile = useMemo(() => firstByLayer(files, 'style'), [files]);
  const layoutFile = useMemo(() => firstByLayer(files, 'layout'), [files]);
  const contentFile = useMemo(() => firstByLayer(files, 'content'), [files]);

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

  const slideNumber = slideFile
    ? files.filter((f) => f.layer === 'slide').sort((a, b) => a.sort_order - b.sort_order).findIndex((f) => f.id === slideFile.id) + 1
    : 0;
  const totalSlides = files.filter((f) => f.layer === 'slide').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col gap-4 overflow-hidden">
        <DialogHeader>
          <DialogTitle>{slideFile?.name ?? 'Slide preview'}</DialogTitle>
          <DialogDescription>
            {slideFile
              ? `Slide ${slideNumber} of ${totalSlides} · ${slideFile.layer} layer · ${slideFile.extension ?? 'html'}`
              : null}
          </DialogDescription>
        </DialogHeader>
        {slideFile ? (
          <div
            className="aspect-video w-full overflow-hidden rounded-lg border border-[var(--bor)] bg-white"
            data-testid="slide-preview-frame"
          >
            <ScaledIframe
              srcDoc={srcDoc}
              naturalWidth={1280}
              naturalHeight={720}
              title={`Preview: ${slideFile.name}`}
              sandbox="allow-same-origin"
              className="h-full w-full"
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}