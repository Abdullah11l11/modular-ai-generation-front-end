import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon, Trash2Icon } from 'lucide-react';

type SlideThumbnailProps = {
  stem: string;
  title: string;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
};

export function SlideThumbnail({ stem, title, isActive, onSelect, onDelete }: SlideThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stem });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-active={isActive || undefined}
      onClick={onSelect}
      className="group flex cursor-pointer items-center gap-2 rounded-md border border-(--bor2) bg-(--bg) p-2 transition-colors hover:border-(--cy)/40 data-[active]:border-(--cy) data-[active]:bg-(--cy-d)"
    >
      <button
        {...attributes}
        {...listeners}
        className="flex size-5 shrink-0 cursor-grab items-center justify-center rounded-xs text-(--t3) hover:text-(--t1) active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVerticalIcon className="size-3.5" />
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-xs font-medium text-(--t1)">{title || stem}</span>
        <span className="text-[10px] text-(--t3)">{stem}</span>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="flex size-5 shrink-0 items-center justify-center rounded-xs text-(--t3) opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
      >
        <Trash2Icon className="size-3" />
      </button>
    </div>
  );
}
