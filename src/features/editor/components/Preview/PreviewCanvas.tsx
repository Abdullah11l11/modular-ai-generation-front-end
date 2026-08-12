import { useProjectFiles } from '@/features/files/hooks/useProjectFiles';
import { useEditorContext } from '@/features/editor/hooks/useEditorStore';
import { useAssemblePreview, assemblePreviewHtml } from '@/features/editor/hooks/useAssemblePreview';
import { groupSlides } from '@/features/editor/utils/groupSlides';
import { PreviewFrame } from '@/features/editor/components/Preview/PreviewFrame';
import { Button } from '@/components/ui/button';
import type { ProjectFile } from '@/types/api';

function findFile(files: ProjectFile[], layer: string, name: string): ProjectFile | undefined {
  return files.find((f) => f.layer === layer && f.name === name);
}

export function PreviewCanvas({
  onApplyProposal,
}: {
  /** Called when the user clicks Apply on the proposal banner. The
   *  parent (EditorPage) is responsible for the actual mutation —
   *  it has access to TanStack Query + the selected slide ID. */
  onApplyProposal?: () => void;
}) {
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

  const liveSrcDoc = useAssemblePreview({
    slideHtml,
    slideCss,
    layoutCss,
    layoutHtml,
    styleCss,
    contentJson,
    direction: state.direction,
  });

  // When a proposal is set, render the proposal HTML inside the
  // project's full visual context (BASE_CSS + style.css + layout.css
  // + data.json) so the user sees the suggested change in the same
  // framing as the live preview. No layout.html wrapper though — the
  // AI output is a slide block, not a full document.
  const proposalSrcDoc = state.proposal
    ? assemblePreviewHtml({
        slideHtml: state.proposal.html,
        slideCss: '',
        layoutCss,
        layoutHtml: '',
        styleCss,
        contentJson,
        direction: state.direction,
      })
    : '';

  const srcDoc = state.proposal ? proposalSrcDoc : liveSrcDoc;

  function handleElementClick(selector: string) {
    dispatch({ type: 'SET_SELECTED_ELEMENT', payload: selector });
  }

  if (empty && !state.proposal) {
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

      {state.proposal && (
        <ProposalBanner
          label={state.proposal.label}
          onApply={() => {
            onApplyProposal?.();
            dispatch({ type: 'APPLY_PROPOSAL' });
          }}
          onDiscard={() => dispatch({ type: 'CLEAR_PROPOSAL' })}
        />
      )}

      <div className="w-full max-w-3xl">
        <PreviewFrame srcDoc={srcDoc} onElementClick={handleElementClick} />
      </div>
    </div>
  );
}

function ProposalBanner({
  label,
  onApply,
  onDiscard,
}: {
  label: string;
  onApply: () => void;
  onDiscard: () => void;
}) {
  return (
    <div
      role="status"
      className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-(--cy) bg-(--bg) px-3 py-1.5 text-xs shadow-lg"
    >
      <span className="size-2 animate-pulse rounded-full bg-(--cy)" />
      <span className="font-medium text-(--t1)">
        Previewing AI proposal{label ? ` — ${label}` : ''}
      </span>
      <span className="text-(--t3)">Apply to save · Discard to drop</span>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="accent"
          onClick={onApply}
          data-testid="proposal-apply"
        >
          Apply
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onDiscard}
          data-testid="proposal-discard"
        >
          Discard
        </Button>
      </div>
    </div>
  );
}
