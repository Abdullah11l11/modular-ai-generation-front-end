import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';

import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { ProjectFile } from '@/features/files/types/projectFile';

import { SlideCard } from './SlideCard';

interface SlideListProps {
  slides: ProjectFile[];
  activeSlideId?: string;
  onSelect: (slide: ProjectFile) => void;
  onDelete: (slide: ProjectFile) => void;
  onReorder: (
    activeId: string,
    overId: string,
  ) => void;
}

export function SlideList({
  slides,
  activeSlideId,
  onSelect,
  onDelete,
  onReorder,
}: SlideListProps) {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    onReorder(
      String(active.id),
      String(over.id),
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={slides.map((slide) => slide.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {slides.map((slide, index) => (
            <SlideCard
              key={slide.id}
              file={slide}
              index={index}
              active={slide.id === activeSlideId}
              onSelect={() => onSelect(slide)}
              onDelete={() => onDelete(slide)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}