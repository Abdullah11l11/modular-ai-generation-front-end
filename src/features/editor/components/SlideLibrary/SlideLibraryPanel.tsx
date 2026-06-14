import { useQueryClient } from '@tanstack/react-query';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useEditorStore } from '@/features/editor/hooks/useEditorStore';
import { SlideList } from '@/features/editor/components/SlideLibrary/SlideList';
import { useCreateProjectFile } from '@/features/files/hooks/useCreateProjectFile';
import { useUpdateProjectFile } from '@/features/files/hooks/useUpdateProjectFile';
import { useDeleteProjectFile } from '@/features/files/hooks/useDeleteProjectFile';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Id, ProjectFile } from '@/types/api';
import { useState } from 'react';

type SlideLibraryPanelProps = {
  projectId: Id;
  slides: ProjectFile[];
  filesLoading: boolean;
  onGenerateLayer?: (fileId: string) => void;
};

export function SlideLibraryPanel({ projectId, slides, filesLoading, onGenerateLayer }: SlideLibraryPanelProps) {
  const { state, dispatch } = useEditorStore();
  const queryClient = useQueryClient();
  const createFile = useCreateProjectFile();
  const updateFile = useUpdateProjectFile();
  const deleteFile = useDeleteProjectFile();
  const [deleteTarget, setDeleteTarget] = useState<Id | null>(null);

  const slideCount = slides.length;
  const nextSlideNumber = slideCount > 0
    ? Math.max(...slides.map((s) => {
        const num = parseInt(s.path.replace(/[^0-9]/g, ''), 10);
        return isNaN(num) ? 0 : num;
      })) + 1
    : 1;

  const handleAddSlide = () => {
    createFile.mutate(
      { projectId, payload: { kind: 'slide', path: `slide-${nextSlideNumber}.html`, content: '' } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'files'] });
        },
      },
    );
  };

  const handleDeleteSlide = () => {
    if (!deleteTarget) return;
    deleteFile.mutate(
      { projectId, fileId: deleteTarget },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'files'] });
          if (state.selectedSlideId === deleteTarget) {
            dispatch({ type: 'SET_SELECTED_SLIDE', payload: null });
          }
          setDeleteTarget(null);
        },
      },
    );
  };

  const handleReorder = (activeId: string, overId: string) => {
    const activeIdx = slides.findIndex((s) => s.id === activeId);
    const overIdx = slides.findIndex((s) => s.id === overId);
    if (activeIdx === -1 || overIdx === -1) return;

    const reordered = [...slides];
    const [moved] = reordered.splice(activeIdx, 1);
    reordered.splice(overIdx, 0, moved);

    reordered.forEach((slide, index) => {
      updateFile.mutate({ projectId, fileId: slide.id, payload: { path: `slide-${index + 1}.html` } });
    });
  };

  const handleSelect = (id: string) => {
    dispatch({ type: 'SET_SELECTED_SLIDE', payload: id });
  };

  return (
    <aside className="flex w-50 shrink-0 flex-col border-r border-(--bor2) bg-(--sur)">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-(--t3)">
          Slides
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleAddSlide}
          disabled={createFile.isPending}
          aria-label="Add slide"
        >
          <PlusIcon className="size-3.5" />
        </Button>
      </div>

      {filesLoading ? (
        <div className="flex flex-1 items-center justify-center px-3">
          <div className="h-4 w-full animate-pulse rounded bg-(--sur3)" />
        </div>
      ) : slides.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-xs text-(--t3)">No slides yet</p>
          <Button variant="outline" size="sm" onClick={handleAddSlide} disabled={createFile.isPending}>
            Add your first slide
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3">
          <SlideList
            slides={slides}
            selectedSlideId={state.selectedSlideId}
            onSelect={handleSelect}
            onReorder={handleReorder}
            onGenerate={onGenerateLayer}
          />

          {state.selectedSlideId && (
            <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 text-(--t3)"
                  onClick={() => setDeleteTarget(state.selectedSlideId)}
                >
                  <Trash2Icon className="mr-1 size-3" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete slide</DialogTitle>
                  <DialogDescription>
                    This will permanently delete this slide and its content. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDeleteSlide} disabled={deleteFile.isPending}>
                    {deleteFile.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}

      <div className="flex shrink-0 border-t border-(--bor2) px-3 py-2">
        <button
          type="button"
          className={`flex-1 rounded px-2 py-1 text-[10px] font-semibold leading-none transition-all ${
            state.layerVisibility.slide ? 'bg-(--t1) text-(--bg)' : 'bg-(--sur2) text-(--t3)'
          }`}
          onClick={() => dispatch({ type: 'TOGGLE_LAYER', payload: 'slide' })}
        >
          STR
        </button>
        <button
          type="button"
          className={`flex-1 rounded px-2 py-1 text-[10px] font-semibold leading-none transition-all ${
            state.layerVisibility.style ? 'bg-(--t1) text-(--bg)' : 'bg-(--sur2) text-(--t3)'
          }`}
          onClick={() => dispatch({ type: 'TOGGLE_LAYER', payload: 'style' })}
        >
          STY
        </button>
        <button
          type="button"
          className={`flex-1 rounded px-2 py-1 text-[10px] font-semibold leading-none transition-all ${
            state.layerVisibility.content ? 'bg-(--t1) text-(--bg)' : 'bg-(--sur2) text-(--t3)'
          }`}
          onClick={() => dispatch({ type: 'TOGGLE_LAYER', payload: 'content' })}
        >
          CON
        </button>
      </div>
    </aside>
  );
}
