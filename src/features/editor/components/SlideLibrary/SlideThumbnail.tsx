import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SlideGroup } from '@/features/editor/utils/groupSlides';

type SlideThumbnailProps = {
  slide: SlideGroup;
  index: number;
  isSelected: boolean;
  onSelect: (fileId: string) => void;
  onDelete: (stem: string) => void;
};

export function SlideThumbnail({ slide, index, isSelected, onSelect, onDelete }: SlideThumbnailProps) {
  const slideFileId = slide.files.slide?.id ?? '';
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide.stem,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex cursor-pointer items-center gap-2 rounded-md border px-2 py-2 text-xs transition-colors ${
        isSelected
          ? 'border-(--cy) bg-(--cy-d)/20 text-(--t1)'
          : 'border-(--bor2) bg-(--sur) text-(--t2) hover:border-(--bor1) hover:text-(--t1)'
      }`}
      onClick={() => {
        if (slideFileId) onSelect(slideFileId);
      }}
    >
      <button
        className="cursor-grab touch-none text-(--t3) hover:text-(--t1)"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-3.5" />
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-medium">{slide.title}</span>
        <span className="text-(--t3)">#{index + 1}</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="invisible size-6 text-(--t3) opacity-0 group-hover:visible group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(slide.stem);
        }}
      >
        <Trash2Icon className="size-3" />
      </Button>
    </div>
  );
}
