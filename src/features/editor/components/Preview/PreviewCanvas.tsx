import { useMemo, useCallback } from 'react';
import { useEditorContext } from '@/features/editor/hooks/useEditorStore';
import { assemblePreviewHtml } from '@/features/editor/hooks/useAssemblePreview';
import { PreviewFrame } from './PreviewFrame';
import { EmptyState } from '@/components/empty-state';
import type { ProjectFile } from '@/types/api';

type PreviewCanvasProps = {
  files: ProjectFile[];
  direction: 'ltr' | 'rtl';
};

export function PreviewCanvas({ files, direction }: PreviewCanvasProps) {
  const { state, dispatch } = useEditorContext();

  const selectedSlide = useMemo(() => {
    if (!state.selectedSlideId) return null;
    return files.find((f) => f.id === state.selectedSlideId) ?? null;
  }, [state.selectedSlideId, files]);

  const stem = selectedSlide?.name ?? '';

  const perSlideCss = useMemo(() => {
    if (!selectedSlide) return '';
    const cssFile = files.find(
      (f) => f.layer === 'style' && f.name === stem && f.extension === 'css',
    );
    return cssFile?.content ?? '';
  }, [selectedSlide, files, stem]);

  const contentVars = useMemo(() => {
    if (!stem) return undefined;
    const contentFile = files.find(
      (f) => f.layer === 'content' && f.name === stem && f.extension === 'json',
    );
    if (!contentFile?.content) return undefined;
    try {
      const parsed = JSON.parse(contentFile.content) as Record<string, unknown>;
      const vars: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === 'string') vars[k] = v;
      }
      return Object.keys(vars).length > 0 ? vars : undefined;
    } catch {
      return undefined;
    }
  }, [stem, files]);

  const styleCss = useMemo(() => {
    const file = files.find(
      (f) => f.layer === 'style' && f.name === 'style' && f.extension === 'css',
    );
    return file?.content ?? '';
  }, [files]);

  const layoutCss = useMemo(() => {
    const file = files.find(
      (f) => f.layer === 'layout' && f.name === 'layout' && f.extension === 'css',
    );
    return file?.content ?? '';
  }, [files]);

  const assembledHtml = useMemo(() => {
    if (!selectedSlide?.content) return '';
    return assemblePreviewHtml(
      selectedSlide.content,
      perSlideCss,
      styleCss,
      layoutCss,
      direction,
      contentVars,
    );
  }, [selectedSlide, perSlideCss, styleCss, layoutCss, direction, contentVars]);

  const handleElementClick = useCallback(
    (selector: string) => {
      dispatch({ type: 'SET_SELECTED_ELEMENT', payload: selector });
    },
    [dispatch],
  );

  if (!state.selectedSlideId || !selectedSlide) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          title="Select a slide to preview"
          description="Choose a slide from the library to see a live preview."
        />
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 items-center justify-center p-4">
      {state.selectedElement && (
        <div className="absolute left-4 top-4 z-10 rounded-xs bg-(--cy) px-2 py-0.5 text-[10px] font-medium text-white">
          {state.selectedElement}
        </div>
      )}

      <div className="aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-lg border border-(--bor2) bg-white shadow-sm">
        <PreviewFrame html={assembledHtml} onElementClick={handleElementClick} />
      </div>
    </div>
  );
}
