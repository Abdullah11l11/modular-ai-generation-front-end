/**
 * Regenerate CSS — pop-out modal that asks the AI to rewrite `style.css`.
 *
 * Self-contained module: owns its own AI call, parser, proposal build,
 * and apply path. Reads the current `style.css` from `useProjectFiles`
 * and shows it as the "before" pane. Streams the model's reply, parses
 * the first fenced ` ```css ` block, builds a `Proposal` with
 * `override.kind = 'style'` so the preview canvas re-renders the live
 * slide with the new CSS, and writes the file on Apply.
 */
import { useEffect, useRef, useState } from 'react';
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
import { useUpdateProjectFile } from '@/features/files/hooks/useUpdateProjectFile';
import { useEditorContext, type Proposal } from '@/features/editor/hooks/useEditorStore';
import { TASK_REGENERATE_STYLE_PROMPT } from '@/lib/ai/prompts';
import { parseFencedBlock } from '@/lib/ai/responseParsers';
import { minimaxService } from '@/lib/ai/providers/minimax';

type Props = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const FILE_NAME = 'style.css';
const PREFERRED_PROVIDER_KEY = 'mgf.ai.preferredProviderId';
const readPreferredProviderId = (): string | null =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(PREFERRED_PROVIDER_KEY);

export function RegenerateStyleModal({ projectId, open, onOpenChange }: Props) {
  const { state, dispatch } = useEditorContext();
  const { data: filesResponse } = useProjectFiles(projectId);
  const files = filesResponse?.data ?? [];
  const current = files.find((f) => f.layer === 'style' && f.name === FILE_NAME);
  const currentContent = current?.content ?? '';

  // Read the preferred provider id from localStorage on demand. We
  // deliberately do NOT lift this into shared state — each modal is
  // self-contained and reads what the chat already chose.
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(() =>
    readPreferredProviderId(),
  );

  const updateMutation = useUpdateProjectFile();
  const queryClient = useQueryClient();

  const [direction, setDirection] = useState('');
  const [response, setResponse] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Reset state when the modal opens so a stale response from a prior
  // session doesn't leak into a new one. Also re-read the preferred
  // provider in case the user changed it in another panel.
  useEffect(() => {
    if (open) {
      setDirection('');
      setResponse('');
      setStreaming(false);
      setError(null);
      setPreviewContent(null);
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
    setStreaming(true);
    setError(null);
    setResponse('');
    setPreviewContent(null);

    const systemPrompt = TASK_REGENERATE_STYLE_PROMPT;
    const userMessage = [
      direction.trim(),
      '',
      `<current-file-content name="${FILE_NAME}" layer="style">`,
      currentContent,
      '</current-file-content>',
    ].join('\n');

    let assistant = '';
    const controller = new AbortController();
    abortRef.current = controller;

    await minimaxService.streamChat(
      {
        model: 'MiniMax-M3',
        system: systemPrompt,
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
          const parsed = parseFencedBlock(assistant, 'css');
          if (!parsed) {
            setError("The model didn't return a single ```css code block. Try rephrasing or use a larger model.");
            return;
          }
          setPreviewContent(parsed);
          const proposal: Proposal = {
            messageId: -1,
            label: `Regenerate ${FILE_NAME}`,
            override: { kind: 'style', content: parsed },
            files: [
              {
                layer: 'style',
                name: FILE_NAME,
                extension: 'css',
                content: parsed,
              },
            ],
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
    if (!previewContent || !current) return;
    try {
      await updateMutation.mutateAsync({
        projectId,
        fileId: current.id,
        payload: { content: previewContent },
      });
      // Refetch the project files so the editor view (library,
      // theme/style/content tabs, preview canvas) reflects the new
      // CSS immediately — without this, the old content lingers in
      // the React Query cache and the user thinks "apply" did
      // nothing.
      await queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'files'],
      });
      dispatch({ type: 'CLEAR_PROPOSAL' });
      toast.success(`Applied change to ${FILE_NAME}`);
      onOpenChange(false);
    } catch (err) {
      toast.error(`Apply failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    }
  };

  const handleDiscard = () => {
    if (state.proposal && state.proposal.files[0]?.name === FILE_NAME) {
      dispatch({ type: 'CLEAR_PROPOSAL' });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(96rem,95vw)] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Regenerate CSS</DialogTitle>
          <DialogDescription>
            Rewrite <span className="font-mono">style.css</span>. The preview canvas re-renders
            the live slide with the new CSS so you can see the change applied before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <Label>Current style.css</Label>
            <pre className="max-h-[60vh] min-h-48 overflow-auto rounded-md border border-(--bor2) bg-(--sur1) p-2 font-mono text-[11px] leading-snug">
              {currentContent || '(empty)'}
            </pre>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="regen-style-direction">Your direction</Label>
            <textarea
              id="regen-style-direction"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              placeholder="e.g. Make the background pure black and the accent electric cyan"
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
            disabled={!previewContent || !current || updateMutation.isPending}
            data-testid="regen-style-apply"
          >
            {updateMutation.isPending ? 'Applying…' : `Apply to ${FILE_NAME}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
