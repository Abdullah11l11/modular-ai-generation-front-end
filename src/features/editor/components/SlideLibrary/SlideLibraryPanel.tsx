import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SlideList } from '@/features/editor/components/SlideLibrary/SlideList';
import { SlidePickerDialog } from '@/features/editor/components/SlideLibrary/SlidePickerDialog';
import { groupSlides, type SlideGroup } from '@/features/editor/utils/groupSlides';
import type { Direction, ProjectFile, ProjectFileKind } from '@/types/api';

type SlideLibraryPanelProps = {
  files: ProjectFile[];
  selectedSlideId: string | null;
  layerVisibility: Record<ProjectFileKind, boolean>;
  onSelectSlide: (fileId: string) => void;
  onToggleLayer: (kind: ProjectFileKind) => void;
  onAddSlide: (sourceStem: string | null) => void;
  onDeleteSlides: (stems: string[]) => void;
  onReorderFiles: (projectId: string, order: string[]) => void;
  projectId: string;
  /** Document direction — controls how thumbnails render when the
   *  assembled preview is shown inside the picker. */
  direction: Direction;
};

const LAYER_BUTTONS: { kind: ProjectFileKind; label: string }[] = [
  { kind: 'slide', label: 'STR' },
  { kind: 'style', label: 'STY' },
  { kind: 'content', label: 'CON' },
];

export function SlideLibraryPanel({
  files,
  selectedSlideId,
  layerVisibility,
  onSelectSlide,
  onToggleLayer,
  onAddSlide,
  onDeleteSlides,
  onReorderFiles,
  projectId,
  direction,
}: SlideLibraryPanelProps) {
  const [deleteTarget, setDeleteTarget] = useState<SlideGroup | null>(null);
  const [clonePickerOpen, setClonePickerOpen] = useState(false);
  const slides = groupSlides(files);

  function handleDelete(stem: string) {
    const target = slides.find((s) => s.stem === stem);
    if (target) setDeleteTarget(target);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    onDeleteSlides([deleteTarget.stem]);
    setDeleteTarget(null);
  }

  function handleReorder(stems: string[]) {
    const fileIds: string[] = [];
    for (const stem of stems) {
      const group = slides.find((s) => s.stem === stem);
      if (group) {
        const ids = [group.files.slide?.id, group.files.style?.id, group.files.content?.id].filter(
          Boolean,
        ) as string[];
        fileIds.push(...ids);
      }
    }
    onReorderFiles(projectId, fileIds);
  }

  function handleAddSlideClick() {
    // If there are no existing slides, skip the picker and create a
    // blank fallback. Otherwise open the clone-from-layout picker.
    if (slides.length === 0) {
      onAddSlide(null);
      return;
    }
    setClonePickerOpen(true);
  }

  function handleCloneFrom(stem: string) {
    setClonePickerOpen(false);
    onAddSlide(stem);
  }

  function handlePickBlank() {
    setClonePickerOpen(false);
    onAddSlide(null);
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <Button variant="accent" size="sm" className="w-full gap-1.5" onClick={handleAddSlideClick}>
        <PlusIcon className="size-3.5" />
        Add Slide
      </Button>

      <div className="flex-1 overflow-y-auto">
        {slides.length === 0 ? (
          <p className="px-2 text-xs text-(--t3)">Add your first slide</p>
        ) : (
          <SlideList
            slides={slides}
            selectedSlideId={selectedSlideId}
            onSelect={onSelectSlide}
            onDelete={handleDelete}
            onReorder={handleReorder}
            projectFiles={files}
            direction={direction}
          />
        )}
      </div>

      <div className="flex items-center gap-1 border-t border-(--bor2) pt-2">
        {LAYER_BUTTONS.map(({ kind, label }) => (
          <button
            key={kind}
            type="button"
            className="lv-btn flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
            style={{
              backgroundColor: layerVisibility[kind] ? 'var(--cy-d)' : 'var(--sur)',
              color: layerVisibility[kind] ? 'var(--cy)' : 'var(--t3)',
            }}
            onClick={() => onToggleLayer(kind)}
          >
            {label}
          </button>
        ))}
      </div>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete slide</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This will remove the slide,
              style, and content files permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SlidePickerDialog
        open={clonePickerOpen}
        onOpenChange={setClonePickerOpen}
        slides={slides}
        projectFiles={files}
        direction={direction}
        onPickBlank={handlePickBlank}
        onPick={handleCloneFrom}
      />
    </div>
  );
}
