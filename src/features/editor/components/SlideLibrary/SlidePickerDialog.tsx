import { useMemo } from 'react';
import { PlusIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScaledIframe } from '@/features/editor/components/Preview/ScaledIframe';
import { assemblePreviewHtml } from '@/features/editor/hooks/useAssemblePreview';
import type { SlideGroup } from '@/features/editor/utils/groupSlides';
import type { Direction, ProjectFile } from '@/types/api';

/**
 * Files the preview assembler needs that aren't carried per-slide.
 * We pull them out of the full project file list so the caller
 * (SlideLibraryPanel) doesn't need to thread four separate fields.
 */
type ProjectContext = {
  styleCss: string;
  layoutHtml: string;
  layoutCss: string;
  /** Per-slide content.json (keyed by the slide's stem). Falls back
   *  to the project's `data.json` if a slide has no companion
   *  content file. */
  contentJson: string | null;
  direction: Direction;
};

type SlidePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slides: SlideGroup[];
  /** All files for the project (used to find project-level layout /
   *  style / data.json and per-slide content). */
  projectFiles: ProjectFile[];
  direction: Direction;
  onPickBlank: () => void;
  onPick: (sourceStem: string) => void;
};

function pickProjectContext(files: ProjectFile[], direction: Direction): ProjectContext {
  const byLayerAndName = (layer: ProjectFile['layer'], name: string) =>
    files.find((f) => f.layer === layer && f.name === name)?.content ?? '';

  // UVCP-style projects put their content in `data.json` (per project),
  // not `content.json` (per slide). Support both names so seeded
  // projects render correctly.
  const contentJson =
    files.find((f) => f.layer === 'content' && f.name === 'content.json')?.content ??
    files.find((f) => f.layer === 'content' && f.name === 'data.json')?.content ??
    null;

  return {
    styleCss: byLayerAndName('style', 'style.css'),
    layoutHtml: byLayerAndName('layout', 'layout.html'),
    layoutCss: byLayerAndName('layout', 'layout.css'),
    contentJson,
    direction,
  };
}

function perSlideContentJson(files: ProjectFile[], stem: string): string | null {
  return (
    files.find((f) => f.layer === 'content' && f.name === `${stem}.json`)?.content ?? null
  );
}

/**
 * Visual "Add Slide" picker. Renders a 2-column grid of mini-iframe
 * thumbnails — one per existing slide — plus a leading "Blank" card
 * that triggers a fresh empty slide. Picking any other card clones
 * that slide's content into the new file.
 */
export function SlidePickerDialog({
  open,
  onOpenChange,
  slides,
  projectFiles,
  direction,
  onPickBlank,
  onPick,
}: SlidePickerDialogProps) {
  const ctx = useMemo(
    () => pickProjectContext(projectFiles, direction),
    [projectFiles, direction],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add slide</DialogTitle>
          <DialogDescription>
            Pick a layout to clone, or start blank. The new slide appears as{' '}
            <span className="font-mono text-(--t2)">slide-NN</span> at the end of the deck.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto p-1">
          {/* Blank card — always first so the user has an obvious
             "I don't want a clone" affordance. */}
          <button
            type="button"
            onClick={onPickBlank}
            className="group flex flex-col gap-2 rounded-lg border border-dashed border-(--bor2) bg-(--sur)/40 p-2 text-left transition-colors hover:border-(--cy) hover:bg-(--cy-d)/20"
          >
            <div
              className="flex w-full items-center justify-center rounded-md bg-(--bg)"
              style={{ aspectRatio: '1280 / 720' }}
            >
              <div className="flex flex-col items-center gap-1 text-(--t3) group-hover:text-(--cy)">
                <PlusIcon className="size-8" strokeWidth={1.5} />
                <span className="text-[11px] font-medium uppercase tracking-wider">Blank</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="truncate text-xs font-medium text-(--t2)">Blank slide</span>
              <span className="shrink-0 text-[10px] text-(--t3)">#new</span>
            </div>
          </button>

          {slides.map((slide, i) => {
            const slideHtml = slide.files.slide?.content ?? '';
            const slideCss = slide.files.style?.content ?? '';
            const ownContent = perSlideContentJson(projectFiles, slide.stem);
            // Per-slide content.json takes precedence over the
            // project-level data.json — seeded UVCP projects use
            // project-level so most cards will fall through.
            const contentJson = ownContent ?? ctx.contentJson;
            const srcDoc = assemblePreviewHtml({
              slideHtml,
              slideCss,
              layoutCss: ctx.layoutCss,
              layoutHtml: ctx.layoutHtml,
              styleCss: ctx.styleCss,
              contentJson,
              direction: ctx.direction,
            });

            return (
              <button
                key={slide.stem}
                type="button"
                onClick={() => onPick(slide.stem)}
                className="group flex flex-col gap-2 rounded-lg border border-(--bor2) bg-(--sur) p-2 text-left transition-colors hover:border-(--cy) hover:bg-(--cy-d)/20"
              >
                <ScaledIframe
                  srcDoc={srcDoc}
                  className="rounded-md bg-(--bg)"
                  title={`Slide ${i + 1} preview`}
                />
                <div className="flex items-center justify-between px-1">
                  <span className="truncate text-xs font-medium text-(--t2)">{slide.title}</span>
                  <span className="shrink-0 text-[10px] text-(--t3)">#{i + 1}</span>
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
