import { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SlideThumbnail } from './SlideThumbnail';
import type { ProjectFile } from '@/types/api';

export type SlideGroup = {
  stem: string;
  sortOrder: number;
  slideFile: ProjectFile;
  styleFile?: ProjectFile;
  contentFile?: ProjectFile;
};

type SlideListProps = {
  slideGroups: SlideGroup[];
  selectedSlideId: string | null;
  onSelectSlide: (fileId: string) => void;
  onDeleteSlide: (stem: string) => void;
  onReorder: (stems: string[]) => void;
  getSlideTitle: (group: SlideGroup) => string;
};

export function SlideList({
  slideGroups,
  selectedSlideId,
  onSelectSlide,
  onDeleteSlide,
  onReorder,
  getSlideTitle,
}: SlideListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const stems = useMemo(() => slideGroups.map((g) => g.stem), [slideGroups]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slideGroups.findIndex((g) => g.stem === active.id);
    const newIndex = slideGroups.findIndex((g) => g.stem === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...slideGroups];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    onReorder(reordered.map((g) => g.stem));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={stems} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-1.5 p-2">
          {slideGroups.map((group) => (
            <SlideThumbnail
              key={group.stem}
              stem={group.stem}
              title={getSlideTitle(group)}
              isActive={group.slideFile.id === selectedSlideId}
              onSelect={() => onSelectSlide(group.slideFile.id)}
              onDelete={() => onDeleteSlide(group.stem)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
