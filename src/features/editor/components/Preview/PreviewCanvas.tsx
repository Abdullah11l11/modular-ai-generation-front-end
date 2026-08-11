import { useProjectFiles } from '@/features/files/hooks/useProjectFiles';
import { useEditorContext } from '@/features/editor/hooks/useEditorStore';
import { useAssemblePreview } from '@/features/editor/hooks/useAssemblePreview';
import { groupSlides } from '@/features/editor/utils/groupSlides';
import { PreviewFrame } from '@/features/editor/components/Preview/PreviewFrame';
import type { ProjectFile } from '@/types/api';

function findFile(files: ProjectFile[], layer: string, name: string): ProjectFile | undefined {
  return files.find((f) => f.layer === layer && f.name === name);
}

export function PreviewCanvas() {
  const { state, dispatch } = useEditorContext();
  const { data: filesResponse } = useProjectFiles(state.projectId);
  const files = filesResponse?.data ?? [];

  const isPerSlide = state.editorMode === 'per-slide';
  const slides = groupSlides(files);

  const selectedGroup = isPerSlide
    ? (slides.find((s) => s.files.slide?.id === state.selectedSlideId) ?? null)
    : null;

  const slideHtml = isPerSlide
    ? (selectedGroup?.files.slide?.content ?? '')
    : (findFile(files, 'slide', 'content.html')?.content ?? '');

  // Project-level style.css is the single source of truth for theming in
  // both editor modes. In per-slide mode it also stands in for the
  // per-slide style file when one isn't present (UVCP convention).
  const styleFile = findFile(files, 'style', 'style.css');
  const styleCss = styleFile?.content ?? '';

  const slideCss = isPerSlide ? styleCss : '';

  const contentJson = isPerSlide
    ? (findFile(files, 'content', 'data.json')?.content ??
      findFile(files, 'content', 'content.json')?.content ??
      null)
    : (findFile(files, 'content', 'content.json')?.content ?? null);

  // `layout.css` is the project's class-rule stylesheet (the MGF layout
  // layer). It must be injected in BOTH editor modes — per-slide AND
  // single-page — because that's where `.mgf-card`, `.mgf-grid-*`,
  // `.mgf-deck`, `.mgf-slide { width:1280px; height:720px; ... }`, etc.
  // are defined. `style.css` only carries `:root { --mgf-* }` tokens.
  const layoutCss = findFile(files, 'layout', 'layout.css')?.content ?? '';

  // `layout.html` is a body-wrapper template (with `{{slides}}`
  // substitution) used in per-slide mode. Single-page mode doesn't have
  // a wrapper — the slide IS the body.
  const layoutHtml = isPerSlide ? (findFile(files, 'layout', 'layout.html')?.content ?? '') : '';

  const empty = isPerSlide ? !selectedGroup : !slideHtml && !layoutCss && !styleCss;

  const srcDoc = useAssemblePreview({
    slideHtml,
    slideCss,
    layoutCss,
    layoutHtml,
    styleCss,
    contentJson,
    direction: state.direction,
  });

  function handleElementClick(selector: string) {
    dispatch({ type: 'SET_SELECTED_ELEMENT', payload: selector });
  }

  if (empty) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-(--t3)">
          {isPerSlide ? 'Select a slide to preview' : 'No content yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 items-center justify-center p-8">
      {state.selectedElement && (
        <span className="absolute left-4 top-4 z-10 rounded-xs bg-(--cy) px-2 py-0.5 text-xs font-medium text-(--cy-fg)">
          {state.selectedElement}
        </span>
      )}

      <div className="w-full max-w-3xl">
        <PreviewFrame srcDoc={srcDoc} onElementClick={handleElementClick} />
      </div>
    </div>
  );
}
