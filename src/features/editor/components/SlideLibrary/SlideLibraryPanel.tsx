import { useMemo, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PlusIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useCreateProjectFile } from '@/features/files/hooks/useCreateProjectFile';
import { useDeleteProjectFile } from '@/features/files/hooks/useDeleteProjectFile';
import { useUpdateProjectFile } from '@/features/files/hooks/useUpdateProjectFile';
import { useEditorContext } from '@/features/editor/hooks/useEditorStore';
import { SlideList, type SlideGroup } from './SlideList';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toastSuccess, toastError } from '@/lib/toast';
import type { ProjectFile, ProjectFileKind, Id } from '@/types/api';

function groupFilesByStem(files: ProjectFile[]): SlideGroup[] {
  const map = new Map<string, SlideGroup>();

  for (const file of files) {
    if (!['slide', 'style', 'content'].includes(file.layer)) continue;

    const stem = file.name;
    let group = map.get(stem);
    if (!group) {
      group = { stem, sortOrder: file.sort_order, slideFile: file } as SlideGroup;
      map.set(stem, group);
    }

    group.sortOrder = file.sort_order;
    if (file.layer === 'slide') group.slideFile = file;
    if (file.layer === 'style') group.styleFile = file;
    if (file.layer === 'content') group.contentFile = file;
  }

  return [...map.values()]
    .filter((g) => g.slideFile)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function getSlideTitle(group: SlideGroup): string {
  if (group.contentFile?.content) {
    try {
      const json = JSON.parse(group.contentFile.content) as Record<string, unknown>;
      if (typeof json.title === 'string' && json.title) return json.title;
    } catch {}
  }
  return group.stem;
}

function nextSlideStem(existingStems: string[]): string {
  let max = 0;
  for (const stem of existingStems) {
    const match = stem.match(/^slide-(\d+)$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return `slide-${String(max + 1).padStart(2, '0')}`;
}

const LAYER_BUTTONS: { label: string; layer: ProjectFileKind }[] = [
  { label: 'STR', layer: 'slide' },
  { label: 'STY', layer: 'style' },
  { label: 'CON', layer: 'content' },
];

type SlideLibraryPanelProps = {
  projectId: Id;
  files: ProjectFile[];
  onGenerateLayer: (stem: string) => void;
};

export function SlideLibraryPanel({ projectId, files, onGenerateLayer }: SlideLibraryPanelProps) {
  const queryClient = useQueryClient();
  const { state, dispatch } = useEditorContext();
  const createFile = useCreateProjectFile();
  const deleteFile = useDeleteProjectFile();
  const updateFile = useUpdateProjectFile();

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const slideGroups = useMemo(() => groupFilesByStem(files), [files]);
  const stems = useMemo(() => slideGroups.map((g) => g.stem), [slideGroups]);

  const invalidateFiles = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'files'] });
  }, [queryClient, projectId]);

  const DEFAULT_SLIDE_HTML = `\
<div class="slide-content" style="padding: 2rem;">
  <h1 class="title" style="font-size: var(--title-size); font-weight: var(--title-weight); color: var(--title-color); text-align: var(--text-align); margin: 0 0 0.5rem 0;">{{title}}</h1>
  <p class="subtitle" style="font-size: var(--subtitle-size); font-weight: var(--subtitle-weight); color: var(--subtitle-color); text-align: var(--text-align); margin: 0 0 0.5rem 0;">{{subtitle}}</p>
  <p class="body" style="font-size: var(--body-size); font-weight: var(--body-weight); color: var(--body-color); text-align: var(--text-align); margin: 0;">{{body}}</p>
</div>`;

  const DEFAULT_SLIDE_CSS = `\
:root {
  --title-size: 2rem;
  --title-weight: bold;
  --title-color: #111827;
  --subtitle-size: 1.25rem;
  --subtitle-weight: normal;
  --subtitle-color: #4b5563;
  --body-size: 1rem;
  --body-weight: normal;
  --body-color: #374151;
  --text-align: left;
}`;

  async function handleAddSlide() {
    const stem = nextSlideStem(stems);
    const sortOrder = slideGroups.length + 1;

    try {
      const slideFile = await createFile.mutateAsync({
        projectId,
        payload: { layer: 'slide', name: stem, extension: 'html', sort_order: sortOrder, content: DEFAULT_SLIDE_HTML },
      });
      await createFile.mutateAsync({
        projectId,
        payload: { layer: 'style', name: stem, extension: 'css', sort_order: sortOrder, content: DEFAULT_SLIDE_CSS },
      });
      await createFile.mutateAsync({
        projectId,
        payload: { layer: 'content', name: stem, extension: 'json', sort_order: sortOrder, content: JSON.stringify({ title: 'New Slide', subtitle: 'Subtitle', body: 'Body content' }) },
      });

      await queryClient.refetchQueries({ queryKey: ['projects', projectId, 'files'] });
      dispatch({ type: 'SET_SELECTED_SLIDE_ID', payload: slideFile.id });
      toastSuccess(`Slide ${stem} created`);
    } catch {
      toastError('Failed to create slide');
    }
  }

  async function handleDeleteSlide(stem: string) {
    const group = slideGroups.find((g) => g.stem === stem);
    if (!group) return;

    const filesToDelete = [group.slideFile, group.styleFile, group.contentFile].filter(Boolean) as ProjectFile[];

    try {
      for (const file of filesToDelete) {
        await deleteFile.mutateAsync({ projectId, fileId: file.id });
      }

      invalidateFiles();
      setDeleteTarget(null);
      toastSuccess(`Slide ${stem} deleted`);
    } catch {
      toastError('Failed to delete slide');
    }
  }

  async function handleReorder(newStems: string[]) {
    try {
      for (let i = 0; i < newStems.length; i++) {
        const group = slideGroups.find((g) => g.stem === newStems[i]);
        if (!group) continue;

        const newOrder = i + 1;
        const filesToUpdate = [group.slideFile, group.styleFile, group.contentFile].filter(Boolean) as ProjectFile[];

        for (const file of filesToUpdate) {
          if (file.sort_order !== newOrder) {
            await updateFile.mutateAsync({ projectId, fileId: file.id, payload: { sort_order: newOrder } });
          }
        }
      }

      invalidateFiles();
    } catch {
      toastError('Failed to reorder slides');
    }
  }

  function handleSelectSlide(fileId: string) {
    dispatch({ type: 'SET_SELECTED_SLIDE_ID', payload: fileId });
  }

  const activeLayers = state.layerVisibility;

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-(--bor2) p-2.5">
        <Button variant="accent" size="sm" className="w-full" onClick={handleAddSlide} disabled={createFile.isPending}>
          <PlusIcon className="size-3.5" />
          Add Slide
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {slideGroups.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-4 text-center text-xs text-(--t3)">
            Add your first slide
          </div>
        ) : (
          <SlideList
            slideGroups={slideGroups}
            selectedSlideId={state.selectedSlideId}
            onSelectSlide={handleSelectSlide}
            onDeleteSlide={(stem) => setDeleteTarget(stem)}
            onReorder={handleReorder}
            onGenerateSlide={(stem) => onGenerateLayer(stem)}
            getSlideTitle={getSlideTitle}
          />
        )}
      </div>

      <div className="flex border-t border-(--bor2)">
        {LAYER_BUTTONS.map((btn) => {
          const isOn = activeLayers[btn.layer];
          return (
            <button
              key={btn.layer}
              onClick={() => dispatch({ type: 'TOGGLE_LAYER', payload: btn.layer })}
              className="flex flex-1 items-center justify-center gap-1 px-2 py-2 text-[10px] font-semibold transition-colors"
              data-state={isOn ? 'on' : 'off'}
              style={{
                backgroundColor: isOn ? 'var(--sur)' : 'transparent',
                color: isOn ? 'var(--t1)' : 'var(--t3)',
              }}
            >
              {isOn ? <EyeIcon className="size-3" /> : <EyeOffIcon className="size-3" />}
              {btn.label}
            </button>
          );
        })}
      </div>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Slide</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget}</strong>? This will remove the HTML, CSS, and JSON files for this slide.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDeleteSlide(deleteTarget)}
              disabled={deleteFile.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
