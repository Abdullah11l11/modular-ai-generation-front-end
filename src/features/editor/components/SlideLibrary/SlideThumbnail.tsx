import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SlideThumbnailProps = {
  id: string;
  name: string;
  isActive: boolean;
  onSelect: () => void;
};

export function SlideThumbnail({ id, name, isActive, onSelect }: SlideThumbnailProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] transition-all duration-150 ${
        isActive
          ? 'border-(--cy) bg-(--cy-d) text-(--t1)'
          : 'border-transparent bg-(--sur2) text-(--t2) hover:bg-(--sur3)'
      } ${isDragging ? 'z-10 opacity-80 shadow-lg' : ''}`}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <span className="grid size-5 shrink-0 place-items-center rounded bg-(--sur3) text-[10px] font-semibold text-(--t3)">
        {name.replace(/[^0-9]/g, '') || '?'}
      </span>
      <span className="truncate">{name}</span>
    </button>
  );
}
