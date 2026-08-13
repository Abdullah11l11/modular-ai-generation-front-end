import { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable as dndUseSortable,
} from '@dnd-kit/sortable';
import {
  Layers3,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import { useProjectFiles } from '@/features/files/hooks/useProjectFiles';
import { useCreateProjectFile } from '@/features/files/hooks/useCreateProjectFile';
import { useDeleteProjectFile } from '@/features/files/hooks/useDeleteProjectFile';
import { useReorderProjectFiles } from '@/features/files/hooks/useReorderProjectFiles';

import type { ProjectFile } from '@/features/files/types/projectFile';

interface SlideFile extends ProjectFile {
  layer: 'slide';
  sort_order: number;
}

interface SlideLibraryPanelProps {
  projectId: string;
  activeSlideId?: string;
  onSlideSelect: (slide: ProjectFile) => void;
}

export function SlideLibraryPanel({
  projectId,
  activeSlideId,
  onSlideSelect,
}: SlideLibraryPanelProps) {
  const {
    data: files = [],
    isLoading,
    isError,
  } = useProjectFiles(projectId);

  // Normalize response: some hooks return a paginated response { data: [] }
  // while others return a plain array. Ensure we always work with an array.
  const fileList = useMemo<ProjectFile[]>(() => {
    if (Array.isArray(files)) return files;
    // files might be a PaginatedResponse<ProjectFile>
    return (files as { data?: ProjectFile[] })?.data ?? [];
  }, [files]);

  const createSlide = useCreateProjectFile();
  const deleteSlide = useDeleteProjectFile(projectId);
  const reorderSlides = useReorderProjectFiles(projectId);

  const [deletingSlideId, setDeletingSlideId] =
    useState<string | null>(null);

  /*
   * Only files with layer === "slide"
   */
  const slides = useMemo<SlideFile[]>(() => {
    return fileList
      .filter((file: ProjectFile) => file.layer === 'slide')
      .sort((a, b) => a.sort_order - b.sort_order) as SlideFile[];
  }, [fileList]);

  /*
   * Add a new slide
   */
  async function handleAddSlide() {
    const nextSortOrder =
      slides.length > 0
        ? Math.max(
            ...slides.map((slide) => slide.sort_order),
          ) + 1
        : 0;

    try {
      const newSlide = await createSlide.mutateAsync({
        projectId,
        payload: {
          layer: 'slide',
          name: `slide-${String(
            slides.length + 1,
          ).padStart(2, '0')}.html`,
          extension: 'html',
          sort_order: nextSortOrder,
          content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <style>
    html,
    body {
      width: 100%;
      height: 100%;
      margin: 0;
    }

    body {
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: sans-serif;
      background: white;
    }

    h1 {
      margin: 0;
      font-size: 48px;
    }
  </style>
</head>

<body>
  <h1>New Slide</h1>
</body>
</html>
        `.trim(),
        },
      });

      /*
       * Make the newly created slide active
       */
      onSlideSelect(newSlide);
    } catch {
      // Mutation error is already handled by React Query.
    }
  }

  /*
   * Drag and drop
   */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      return;
    }

    if (active.id === over.id) {
      return;
    }

    const oldIndex = slides.findIndex(
      (slide) => slide.id === active.id,
    );

    const newIndex = slides.findIndex(
      (slide) => slide.id === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedSlides = arrayMove(
      slides,
      oldIndex,
      newIndex,
    ).map((slide, index) => ({
      ...slide,
      sort_order: index,
    }));

    reorderSlides.mutate(reorderedSlides);
  }

  /*
   * Delete slide
   */
  async function handleDeleteSlide(slide: ProjectFile) {
    const confirmed = window.confirm(
      `Delete "${slide.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingSlideId(slide.id);

    try {
      await deleteSlide.mutateAsync(slide.id);

      /*
       * If deleted slide was active,
       * select another slide.
       */
      if (activeSlideId === slide.id) {
        const remainingSlides = slides.filter(
          (item) => item.id !== slide.id,
        );

        if (remainingSlides.length > 0) {
          onSlideSelect(remainingSlides[0]);
        }
      }
    } finally {
      setDeletingSlideId(null);
    }
  }

  return (
    <aside className="flex h-full w-[200px] shrink-0 flex-col border-r border-(--bor2) bg-(--bg)">
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center justify-between px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Layers3 className="size-4 shrink-0 text-(--cy)" />

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-(--t1)">
              Slides
            </p>

            <p className="font-mono text-[9px] text-(--t3)">
              {slides.length} slides
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleAddSlide}
          disabled={createSlide.isPending}
          aria-label="Add slide"
          title="Add slide"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <Separator />

      {/* Slide list */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-2 p-2">
          {/* Loading */}
          {isLoading && (
            <>
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="space-y-2"
                >
                  <Skeleton className="aspect-video w-full rounded-md" />

                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-xs text-destructive">
                Failed to load slides.
              </p>
            </div>
          )}

          {/* Empty */}
          {!isLoading &&
            !isError &&
            slides.length === 0 && (
              <div className="flex flex-col items-center justify-center px-2 py-10 text-center">
                <Layers3 className="mb-3 size-7 text-(--t3)" />

                <p className="text-xs font-medium text-(--t1)">
                  No slides yet
                </p>

                <p className="mt-1 text-[10px] leading-relaxed text-(--t3)">
                  Add your first slide to start editing.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={handleAddSlide}
                  disabled={createSlide.isPending}
                >
                  <Plus className="mr-2 size-3.5" />
                  Add slide
                </Button>
              </div>
            )}

          {/* Slides */}
          {!isLoading &&
            !isError &&
            slides.length > 0 && (
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={slides.map(
                    (slide) => slide.id,
                  )}
                  strategy={
                    verticalListSortingStrategy
                  }
                >
                  {slides.map((slide, index) => (
                    <SlideCard
                      key={slide.id}
                      slide={slide}
                      index={index}
                      active={
                        slide.id === activeSlideId
                      }
                      deleting={
                        deletingSlideId === slide.id
                      }
                      onSelect={() =>
                        onSlideSelect(slide)
                      }
                      onDelete={() =>
                        handleDeleteSlide(slide)
                      }
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="shrink-0 border-t border-(--bor2) p-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleAddSlide}
          disabled={createSlide.isPending}
        >
          <Plus className="mr-2 size-3.5" />
          {createSlide.isPending
            ? 'Adding...'
            : 'Add slide'}
        </Button>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Slide Card                                                                  */
/* -------------------------------------------------------------------------- */

interface SlideCardProps {
  slide: ProjectFile;
  index: number;
  active: boolean;
  deleting: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SlideCard({
  slide,
  index,
  active,
  deleting,
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
    id: slide.id,
  });

  const style = {
    transform:
      transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'group relative',
        isDragging
          ? 'z-50 opacity-70'
          : '',
      ].join(' ')}
    >
      <div
        className={[
          'relative overflow-hidden rounded-md border',
          'bg-(--bg)',
          'transition-all',
          'cursor-pointer',
          active
            ? 'border-(--cy) ring-1 ring-(--cy)'
            : 'border-(--bor2) hover:border-(--t3)',
        ].join(' ')}
        onClick={onSelect}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-white">
          {slide.content ? (
            <iframe
              title={slide.name}
              srcDoc={slide.content}
              sandbox=""
              tabIndex={-1}
              className="pointer-events-none absolute left-0 top-0 h-[1000%] w-[1000%] origin-top-left scale-[0.1] border-0"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-(--bg2)">
              <Layers3 className="size-5 text-(--t3)" />
            </div>
          )}

          {/* Slide number */}
          <div className="absolute left-1 top-1 flex size-5 items-center justify-center rounded bg-black/70 font-mono text-[9px] font-medium text-white">
            {index + 1}
          </div>

          {/* Drag handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className={[
              'absolute right-1 top-1',
              'flex size-6 items-center justify-center',
              'rounded bg-black/70 text-white',
              'cursor-grab opacity-0',
              'transition-opacity',
              'group-hover:opacity-100',
              'active:cursor-grabbing',
            ].join(' ')}
            onClick={(event) => {
              event.stopPropagation();
            }}
            aria-label={`Move ${slide.name}`}
          >
            <GripVertical className="size-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            className={[
              'absolute bottom-1 right-1',
              'flex size-6 items-center justify-center',
              'rounded bg-destructive text-white',
              'opacity-0 transition-opacity',
              'group-hover:opacity-100',
              deleting
                ? 'pointer-events-none opacity-50'
                : '',
            ].join(' ')}
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            aria-label={`Delete ${slide.name}`}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        {/* Footer */}
        <div className="flex min-w-0 items-center gap-2 px-2 py-1.5">
          <span
            className={[
              'truncate font-mono text-[9px]',
              active
                ? 'text-(--cy)'
                : 'text-(--t3)',
            ].join(' ')}
          >
            {slide.name}
          </span>
        </div>
      </div>
    </div>
  );
}

function useSortable(arg0: { id: string; }) {
  const sortable = dndUseSortable(arg0 as any);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = sortable;

  return {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  };
}
