import { useMemo, useRef, useCallback } from 'react';
import { useEditorStore } from '@/features/editor/hooks/useEditorStore';
import { assemblePreview } from '@/features/editor/hooks/useAssemblePreview';
import { PreviewFrame } from '@/features/editor/components/Preview/PreviewFrame';
import type { ProjectFile, Project } from '@/types/api';

type PreviewCanvasProps = {
  project: Project;
  selectedSlide: ProjectFile | null;
  styleFile: ProjectFile | null;
  layoutFile: ProjectFile | null;
};

export function PreviewCanvas({ project, selectedSlide, styleFile, layoutFile }: PreviewCanvasProps) {
  const { state, dispatch } = useEditorStore();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const html = useMemo(() => {
    if (!selectedSlide) return '';
    return assemblePreview({
      slideHtml: selectedSlide.content || '',
      styleCss: styleFile?.content || '',
      layoutCss: layoutFile?.content || '',
      direction: project.direction,
    });
  }, [selectedSlide, styleFile, layoutFile, project.direction]);

  const handleElementClick = useCallback(
    (selector: string) => {
      dispatch({ type: 'SET_SELECTED_ELEMENT', payload: selector });
    },
    [dispatch],
  );

  if (!selectedSlide) {
    return (
      <div className="flex flex-1 items-center justify-center bg-(--bg)">
        <p className="text-sm text-(--t3)">Select a slide to preview</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 items-center justify-center bg-(--bg) p-6">
      {state.selectedElement && (
        <div className="absolute top-3 left-3 z-10 rounded bg-(--cy) px-2 py-0.5 text-[10px] font-semibold text-white">
          {state.selectedElement}
        </div>
      )}

      <PreviewFrame html={html} onElementClick={handleElementClick} iframeRef={iframeRef} />
    </div>
  );
}
