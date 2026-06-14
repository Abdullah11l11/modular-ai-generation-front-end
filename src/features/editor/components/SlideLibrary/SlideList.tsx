import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SlideThumbnail } from '@/features/editor/components/SlideLibrary/SlideThumbnail';
import type { ProjectFile } from '@/types/api';

type SlideListProps = {
  slides: ProjectFile[];
  selectedSlideId: string | null;
  onSelect: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onGenerate?: (fileId: string) => void;
};

export function SlideList({ slides, selectedSlideId, onSelect, onReorder, onGenerate }: SlideListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-1">
          {slides.map((slide) => (
            <SlideThumbnail
              key={slide.id}
              id={slide.id}
              name={slide.path}
              isActive={slide.id === selectedSlideId}
              onSelect={() => onSelect(slide.id)}
              onGenerate={onGenerate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
