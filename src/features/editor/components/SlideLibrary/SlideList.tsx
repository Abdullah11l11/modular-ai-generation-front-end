import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo } from 'react';
import { SlideThumbnail } from '@/features/editor/components/SlideLibrary/SlideThumbnail';
import { assemblePreviewHtml } from '@/features/editor/hooks/useAssemblePreview';
import type { SlideGroup } from '@/features/editor/utils/groupSlides';
import type { Direction, ProjectFile } from '@/types/api';

type SlideListProps = {
  slides: SlideGroup[];
  selectedSlideId: string | null;
  onSelect: (fileId: string) => void;
  onDelete: (stem: string) => void;
  onReorder: (stems: string[]) => void;
  /** Project-level files needed to assemble each thumbnail's HTML.
   *  Same extraction logic as the picker — see SlidePickerDialog. */
  projectFiles: ProjectFile[];
  direction: Direction;
};

/** Resolve project-level CSS / layout / data once per render. */
function useProjectContext(files: ProjectFile[], direction: Direction) {
  return useMemo(() => {
    const byLayerAndName = (layer: ProjectFile['layer'], name: string) =>
      files.find((f) => f.layer === layer && f.name === name)?.content ?? '';
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
  }, [files, direction]);
}

/** Per-slide content.json lookup (falls back to project-level data.json). */
function perSlideContentJson(files: ProjectFile[], stem: string): string | null {
  return (
    files.find((f) => f.layer === 'content' && f.name === `${stem}.json`)?.content ?? null
  );
}

export function SlideList({
  slides,
  selectedSlideId,
  onSelect,
  onDelete,
  onReorder,
  projectFiles,
  direction,
}: SlideListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );
  const ctx = useProjectContext(projectFiles, direction);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex((s) => s.stem === active.id);
    const newIndex = slides.findIndex((s) => s.stem === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...slides];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    onReorder(reordered.map((s) => s.stem));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={slides.map((s) => s.stem)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-1">
          {slides.map((slide, i) => {
            // Pre-compute the assembled HTML per slide. Memo key is
            // (slide content, project file contents) so editing any
            // of them invalidates just the affected thumbnail.
            const slideHtml = slide.files.slide?.content ?? '';
            const slideCss = slide.files.style?.content ?? '';
            const ownContent = perSlideContentJson(projectFiles, slide.stem);
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
              <SlideThumbnail
                key={slide.stem}
                slide={slide}
                index={i}
                isSelected={selectedSlideId === slide.files.slide?.id}
                srcDoc={srcDoc}
                onSelect={onSelect}
                onDelete={onDelete}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
