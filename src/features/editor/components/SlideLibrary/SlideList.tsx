import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SlideThumbnail } from '@/features/editor/components/SlideLibrary/SlideThumbnail';
import type { SlideGroup } from '@/features/editor/utils/groupSlides';

type SlideListProps = {
  slides: SlideGroup[];
  selectedSlideId: string | null;
  onSelect: (fileId: string) => void;
  onDelete: (stem: string) => void;
  onReorder: (stems: string[]) => void;
};

export function SlideList({ slides, selectedSlideId, onSelect, onDelete, onReorder }: SlideListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

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
          {slides.map((slide, i) => (
            <SlideThumbnail
              key={slide.stem}
              slide={slide}
              index={i}
              isSelected={selectedSlideId === slide.files.slide?.id}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
