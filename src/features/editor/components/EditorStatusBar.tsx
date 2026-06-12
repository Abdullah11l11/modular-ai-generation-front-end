import { useEditorStore } from '@/features/editor/hooks/useEditorStore';
import { useProjectFiles } from '@/features/files/hooks/useProjectFiles';

export function EditorStatusBar() {
  const { state } = useEditorStore();
  const { data: files } = useProjectFiles(state.projectId);

  const slideIndex = state.selectedSlideId
    ? (files?.data ?? []).findIndex((f) => f.id === state.selectedSlideId)
    : -1;

  const activeLayerLabels = (Object.entries(state.layerVisibility) as [string, boolean][])
    .filter(([, visible]) => visible)
    .map(([kind]) => kind.toUpperCase())
    .join(', ');

  return (
    <div className="flex h-7 shrink-0 items-center gap-3 border-t border-(--bor2) bg-(--sur) px-3 text-[11px] font-medium text-(--t3)">
      <span>
        Slide {slideIndex >= 0 ? slideIndex + 1 : '-'} / {files?.data?.length ?? 0}
      </span>

      <span className="h-3 w-px bg-(--bor2)" />

      <span className="truncate">
        {state.selectedElement ?? 'No element selected'}
      </span>

      <span className="h-3 w-px bg-(--bor2)" />

      <span className="truncate font-mono tracking-tight text-(--t2)">
        {activeLayerLabels || 'No layers'}
      </span>
    </div>
  );
}
