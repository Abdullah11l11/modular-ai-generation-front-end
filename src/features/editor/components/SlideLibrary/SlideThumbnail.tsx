import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { SparklesIcon } from 'lucide-react';

type SlideThumbnailProps = {
  id: string;
  name: string;
  isActive: boolean;
  onSelect: () => void;
  onGenerate?: (fileId: string) => void;
};

export function SlideThumbnail({ id, name, isActive, onSelect, onGenerate }: SlideThumbnailProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] transition-all duration-150 ${
        isActive
          ? 'border-(--cy) bg-(--cy-d) text-(--t1)'
          : 'border-transparent bg-(--sur2) text-(--t2) hover:bg-(--sur3)'
      } ${isDragging ? 'z-10 opacity-80 shadow-lg' : ''}`}
      {...attributes}
      {...listeners}
    >
      <button
        type="button"
        className="flex flex-1 items-center gap-2 min-w-0"
        onClick={onSelect}
      >
        <span className="grid size-5 shrink-0 place-items-center rounded bg-(--sur3) text-[10px] font-semibold text-(--t3)">
          {name.replace(/[^0-9]/g, '') || '?'}
        </span>
        <span className="truncate">{name}</span>
      </button>

      {onGenerate && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onGenerate(id);
          }}
          className="flex size-5 shrink-0 items-center justify-center rounded text-(--t3) opacity-0 transition-all hover:bg-(--cy-d) hover:text-(--cy) group-hover:opacity-100"
          aria-label={`Generate ${name}`}
        >
          <SparklesIcon className="size-3" />
        </button>
      )}
    </div>
  );
}
