/**
 * Regenerate Structure — pop-out modal for slide HTMLs.
 *
 * Self-contained module. Two sub-modes:
 *  - **Modify current slide**: the AI rewrites the currently selected
 *    `slide-XX.html`. The preview canvas re-renders the live slide with
 *    the new HTML swapped in.
 *  - **Add new slide(s)**: the AI emits one or more new slide HTML
 *    blocks (multi-slide supported via `<!-- slide-NN -->` markers).
 *    On Apply, each block becomes a new file with the next available
 *    `slide-XX.html` name.
 *
 * Modality: the AI is its own layer, but the proposal build is the
 * closest to the existing ChatView flow — each `ProposalFile` gets
 * a `name` + `extension` so `handleApplyProposal` can route them
 * correctly (existing → PUT, missing → POST).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useProjectFiles } from '@/features/files/hooks/useProjectFiles';
import { useCreateProjectFile } from '@/features/files/hooks/useCreateProjectFile';
import { useUpdateProjectFile } from '@/features/files/hooks/useUpdateProjectFile';
import { useEditorContext, type Proposal } from '@/features/editor/hooks/useEditorStore';
import { TASK_REGENERATE_STRUCTURE_PROMPT } from '@/lib/ai/prompts';
import { parseHtmlBlocks } from '@/lib/ai/responseParsers';
import { minimaxService } from '@/lib/ai/providers/minimax';
import type { ProjectFile } from '@/types/api';

type Props = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Mode = 'modify' | 'add';

const PREFERRED_PROVIDER_KEY = 'mgf.ai.preferredProviderId';
const readPreferredProviderId = (): string | null =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(PREFERRED_PROVIDER_KEY);

/** Pull the slide index from a slide file name (e.g. `slide-03.html` → 3). */
function slideIndexFromName(name: string): number {
  const m = name.match(/slide-(\d+)/i);
  return m ? parseInt(m[1], 10) : 0;
}

export function RegenerateStructureModal({ projectId, open, onOpenChange }: Props) {
  const { state, dispatch } = useEditorContext();
  const { data: filesResponse } = useProjectFiles(projectId);
  const files = filesResponse?.data ?? [];
  const slideFiles = useMemo(
    () => files.filter((f: ProjectFile) => f.layer === 'slide' && f.name.endsWith('.html')),
    [files],
  );
  const currentSlideFile = useMemo(() => {
    if (!state.selectedSlideId) return slideFiles[0] ?? null;
    return (
      slideFiles.find((f: ProjectFile) => f.id === state.selectedSlideId) ?? slideFiles[0] ?? null
    );
  }, [slideFiles, state.selectedSlideId]);

  // Read layout.css once per render so the prompt can include the real
  // `mgf-*` class vocabulary — the AI must only emit classes that
  // actually exist, otherwise the rendered slide is unstyled.
  const layoutCss =
    files.find((f: ProjectFile) => f.layer === 'layout' && f.name === 'layout.css')?.content ?? '';

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(() =>
    readPreferredProviderId(),
  );

  const createMutation = useCreateProjectFile();
  const updateMutation = useUpdateProjectFile();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<Mode>('modify');
  const [direction, setDirection] = useState('');
  const [response, setResponse] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedBlocks, setParsedBlocks] = useState<string[] | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Derived once per render so both `handleGenerate` and `handleApply`
  // can use the same target file without re-deriving inside closures.
  const modifyTarget = mode === 'modify' ? currentSlideFile : null;

  // Reset state whenever the modal opens so a stale response from a
  // previous session can't leak in. We do NOT clear the proposal on
  // unmount — the user might still want to inspect the live preview
  // banner after closing the modal.
  useEffect(() => {
    if (open) {
      setMode('modify');
      setDirection('');
      setResponse('');
      setStreaming(false);
      setError(null);
      setParsedBlocks(null);
      setSelectedProviderId(readPreferredProviderId());
    } else {
      abortRef.current?.abort();
      abortRef.current = null;
    }
  }, [open]);

  const handleGenerate = async () => {
    if (!direction.trim() || streaming) return;
    if (!selectedProviderId) {
      setError('No AI provider selected. Open Settings → AI Providers to add one.');
      return;
    }
    if (mode === 'modify' && !currentSlideFile) {
      setError('No slide selected to modify. Pick a slide in the library first.');
      return;
    }
    setStreaming(true);
    setError(null);
    setResponse('');
    setParsedBlocks(null);

    // Build the context block. For modify, ship the current slide HTML.
    // For add, we ship a short sibling summary so the AI stays consistent.
    // `layout.css` is always shipped so the AI can ONLY pick classes
    // that actually exist in the project — without it the model
    // invents class names that resolve to nothing on render.
    const contextLines: string[] = [direction.trim(), ''];
    if (modifyTarget) {
      contextLines.push(
        `<current-file-content name="${modifyTarget.name}" layer="slide">`,
        modifyTarget.content ?? '',
        '</current-file-content>',
      );
    } else {
      const names = slideFiles.map((s: ProjectFile) => `  - ${s.name}`).join('\n');
      contextLines.push(
        '<existing-slides>',
        names || '  (none)',
        '</existing-slides>',
      );
    }
    contextLines.push(
      '',
      '<layout-css name="layout.css">',
      layoutCss || '(no layout.css in this project)',
      '</layout-css>',
    );
    const userMessage = contextLines.join('\n');

    let assistant = '';
    const controller = new AbortController();
    abortRef.current = controller;

    await minimaxService.streamChat(
      {
        model: 'MiniMax-M3',
        system: TASK_REGENERATE_STRUCTURE_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
        providerId: selectedProviderId,
        signal: controller.signal,
      },
      {
        onDelta: (text) => {
          assistant += text;
          setResponse(assistant);
        },
        onDone: () => {
          setStreaming(false);
          abortRef.current = null;
          const blocks = parseHtmlBlocks(assistant);
          if (blocks.length === 0) {
            setError(
              "The model didn't return any ```html code blocks. Try rephrasing or use a larger model.",
            );
            return;
          }
          // For modify, ignore any extras beyond the first block — the
          // prompt told the model to emit exactly one.
          const final =
            mode === 'modify' ? blocks.slice(0, 1) : blocks;
          setParsedBlocks(final);

          // Build the proposal:
          //  - modify: 1 file with the current slide's name (PUT)
          //  - add:    N files each with the next available slide-XX name (POST),
          //            assigned sequentially so the renderable order is preserved.
          const startingNum =
            Math.max(0, ...slideFiles.map((s: ProjectFile) => slideIndexFromName(s.name))) + 1;
          const modifyName = modifyTarget?.name;
          const proposalFiles = final.map((content, i) => {
            if (modifyName) {
              return {
                layer: 'slide' as const,
                name: modifyName,
                extension: 'html',
                content,
              };
            }
            const num = String(startingNum + i).padStart(2, '0');
            return {
              layer: 'slide' as const,
              name: `slide-${num}.html`,
              extension: 'html',
              content,
            };
          });

          const proposal: Proposal = {
            messageId: -1,
            label:
              mode === 'modify'
                ? `Regenerate slide ${modifyName ?? ''}`
                : `Add ${final.length} new slide${final.length === 1 ? '' : 's'}`,
            // For "modify", previewHtml renders the new HTML directly so
            // the canvas shows the new structure. For "add", previewHtml
            // is the first new block (the most useful single preview).
            previewHtml: final[0],
            files: proposalFiles,
          };
          dispatch({ type: 'SET_PROPOSAL', payload: proposal });
        },
        onError: (err) => {
          setStreaming(false);
          abortRef.current = null;
          setError(err instanceof Error ? err.message : String(err));
        },
      },
    );
  };

  const handleApply = async () => {
    if (!parsedBlocks) return;

    // Build the same plan the proposal used so we know which slide
    // names to PUT vs POST. Re-derived here (instead of stashed in
    // state) so the apply logic is independent of when onDone ran.
    const modifyName = modifyTarget?.name;
    const startingNum =
      Math.max(0, ...slideFiles.map((s: ProjectFile) => slideIndexFromName(s.name))) + 1;
    const plans = parsedBlocks.map((content, i) => {
      if (modifyName) {
        const existing = slideFiles.find((s: ProjectFile) => s.name === modifyName);
        if (existing) {
          return { kind: 'update' as const, fileId: existing.id, name: modifyName, content };
        }
      }
      const num = String(startingNum + i).padStart(2, '0');
      return {
        kind: 'create' as const,
        name: `slide-${num}.html`,
        content,
      };
    });

    try {
      await Promise.all(
        plans.map((p) =>
          p.kind === 'update'
            ? updateMutation.mutateAsync({
                projectId,
                fileId: p.fileId,
                payload: { content: p.content },
              })
            : createMutation.mutateAsync({
                projectId,
                payload: {
                  layer: 'slide',
                  name: p.name,
                  extension: 'html',
                  content: p.content,
                },
              }),
        ),
      );
      // Refetch the project files so the slide library, file tabs,
      // and preview canvas all show the new slide(s) immediately.
      await queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'files'],
      });
      dispatch({ type: 'CLEAR_PROPOSAL' });
      toast.success(
        `Applied ${plans.length === 1 ? '1 slide' : `${plans.length} slides`}.`,
      );
      onOpenChange(false);
    } catch (err) {
      toast.error(
        `Apply failed: ${err instanceof Error ? err.message : 'unknown error'}`,
      );
    }
  };

  const handleDiscard = () => {
    if (state.proposal && state.proposal.label.startsWith('Regenerate slide')) {
      dispatch({ type: 'CLEAR_PROPOSAL' });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(96rem,95vw)] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Regenerate Structure</DialogTitle>
          <DialogDescription>
            Rewrite the current slide HTML or add new slide(s). Single-block replies modify one
            slide; multi-block replies (separated by <span className="font-mono">&lt;!-- slide-NN --&gt;</span>{' '}
            markers) create multiple slides.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 text-xs">
            <input
              type="radio"
              name="regen-structure-mode"
              value="modify"
              checked={mode === 'modify'}
              onChange={() => setMode('modify')}
              disabled={streaming}
            />
            <span>Modify current slide</span>
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="radio"
              name="regen-structure-mode"
              value="add"
              checked={mode === 'add'}
              onChange={() => setMode('add')}
              disabled={streaming}
            />
            <span>Add new slide(s)</span>
          </label>
          {layoutCss && (
            <span className="text-[11px] text-(--t3)">
              Sending <code className="font-mono">layout.css</code> ({layoutCss.length} chars)
              so the AI uses real <code className="font-mono">mgf-*</code> classes.
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <Label>
              {mode === 'modify' && currentSlideFile
                ? `Current ${currentSlideFile.name}`
                : 'Existing slides'}
            </Label>
            <pre className="max-h-[60vh] min-h-48 overflow-auto rounded-md border border-(--bor2) bg-(--sur1) p-2 font-mono text-[11px] leading-snug">
              {mode === 'modify' && currentSlideFile
                ? (currentSlideFile.content || '(empty)')
                : (slideFiles.map((s: ProjectFile) => s.name).join('\n') || '(none)')}
            </pre>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="regen-structure-direction">Your direction</Label>
            <textarea
              id="regen-structure-direction"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              placeholder={
                mode === 'modify'
                  ? 'e.g. Swap the hero copy for a stats component with three KPIs'
                  : 'e.g. Add three slides: a problem statement, a solution, and a closing CTA'
              }
              className="min-h-48 rounded-md border border-(--bor2) bg-(--bg) p-2 text-xs"
              disabled={streaming}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>AI response</Label>
            <pre className="max-h-[60vh] min-h-48 overflow-auto rounded-md border border-(--bor2) bg-(--sur1) p-2 font-mono text-[11px] leading-snug">
              {response || (streaming ? 'Streaming…' : '(click Generate)')}
            </pre>
          </div>
        </div>

        {parsedBlocks && parsedBlocks.length > 0 && (
          <div className="flex flex-col gap-1">
            <Label>Parsed blocks ({parsedBlocks.length})</Label>
            <ol className="list-decimal pl-5 text-[11px]">
              {parsedBlocks.map((b, i) => (
                <li key={i} className="truncate">
                  <span className="font-mono text-[11px]">{b.slice(0, 80)}…</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {error && <p className="mt-2 text-[12px] text-destructive">{error}</p>}

        <DialogFooter className="mt-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleDiscard}>
            Discard
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={streaming || !direction.trim() || !selectedProviderId}
          >
            {streaming ? 'Generating…' : 'Generate'}
          </Button>
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={handleApply}
            disabled={!parsedBlocks || createMutation.isPending || updateMutation.isPending}
            data-testid="regen-structure-apply"
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Applying…'
              : parsedBlocks
                ? mode === 'modify'
                  ? `Apply to ${modifyTarget?.name ?? 'slide'}`
                  : `Add ${parsedBlocks.length} slide${parsedBlocks.length === 1 ? '' : 's'}`
                : mode === 'modify'
                  ? 'Apply'
                  : 'Generate first'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
