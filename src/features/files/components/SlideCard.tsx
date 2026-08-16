import {
  useSortable,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

import {
  GripVertical,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
} from '@/components/ui/card';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';

import type { ProjectFile } from '@/features/files/types/projectFile';

import { SlideThumbnail } from './SlideThumbnail';

interface SlideCardProps {
  file: ProjectFile;
  index: number;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function SlideCard({
  file,
  index,
  active,
  onSelect,
  onDelete,
}: SlideCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: file.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative',
        isDragging && 'z-50 opacity-70',
      )}
    >
      <Card
        className={cn(
          'group cursor-pointer overflow-hidden border transition',
          active &&
            'border-[var(--cy)] ring-1 ring-[var(--cy)]',
        )}
        onClick={onSelect}
      >
        <CardContent className="p-2">
          <div className="relative">
            <SlideThumbnail
              file={file}
              active={active}
            />

            <div className="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded bg-background/90 px-1 font-mono text-[9px] font-medium">
              {index + 1}
            </div>

            <div
              {...attributes}
              {...listeners}
              className={cn(
                'absolute right-1 top-1 cursor-grab rounded',
                'bg-background/90 p-1 opacity-0 transition',
                'group-hover:opacity-100 active:cursor-grabbing',
              )}
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <GripVertical className="h-3.5 w-3.5" />
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className={cn(
                    'absolute bottom-1 right-1 h-6 w-6',
                    'opacity-0 transition',
                    'group-hover:opacity-100',
                  )}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                Delete slide
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="mt-2 truncate font-mono text-[10px] text-muted-foreground">
            {file.name}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}