/**
 * Regenerate Content — pop-out modal that asks the AI to rewrite `data.json`.
 *
 * Self-contained module, mirrors the modular pattern from
 * `RegenerateStyleModal`. Reads the current `data.json` from
 * `useProjectFiles`, shows it as the "before" pane, streams the AI
 * reply, parses the first fenced ` ```json ` block, validates it as
 * JSON, builds a `Proposal` with `override.kind = 'content'` so the
 * preview canvas re-renders the live slide with the new data, and
 * writes the file on Apply.
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
import { TASK_REGENERATE_CONTENT_PROMPT } from '@/lib/ai/prompts';
import { parseJsonBlock } from '@/lib/ai/responseParsers';
import { minimaxService } from '@/lib/ai/providers/minimax';

type Props = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const FILE_NAME = 'data.json';
const PREFERRED_PROVIDER_KEY = 'mgf.ai.preferredProviderId';
const readPreferredProviderId = (): string | null =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(PREFERRED_PROVIDER_KEY);

export function RegenerateContentModal({ projectId, open, onOpenChange }: Props) {
  const { state, dispatch } = useEditorContext();
  const { data: filesResponse } = useProjectFiles(projectId);
  const files = filesResponse?.data ?? [];
  const current = files.find((f) => f.layer === 'content' && f.name === FILE_NAME);
  const currentContent = current?.content ?? '';

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

    const systemPrompt = TASK_REGENERATE_CONTENT_PROMPT;
    const userMessage = [
      direction.trim(),
      '',
      `<current-file-content name="${FILE_NAME}" layer="content">`,
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
          const parsed = parseJsonBlock(assistant);
          if (!parsed.ok) {
            setError(
              parsed.error.startsWith('No JSON')
                ? "The model didn't return a single ```json code block. Try rephrasing or use a larger model."
                : `Invalid JSON from the model: ${parsed.error}`,
            );
            return;
          }
          // Re-stringify the parsed value to normalize whitespace and
          // guarantee the preview receives well-formed JSON regardless
          // of what the model emitted.
          const normalized = JSON.stringify(parsed.value, null, 2);
          setPreviewContent(normalized);
          const proposal: Proposal = {
            messageId: -1,
            label: `Regenerate ${FILE_NAME}`,
            override: { kind: 'content', content: normalized },
            files: [
              {
                layer: 'content',
                name: FILE_NAME,
                extension: 'json',
                content: normalized,
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Regenerate Content</DialogTitle>
          <DialogDescription>
            Rewrite <span className="font-mono">data.json</span>. The preview canvas re-renders
            the live slide with the new data substituted in so you can see the change applied
            before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label>Current data.json</Label>
            <pre className="max-h-48 overflow-auto rounded-md border border-(--bor2) bg-(--sur1) p-2 font-mono text-[11px] leading-snug">
              {currentContent || '(empty)'}
            </pre>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="regen-content-direction">Your direction</Label>
            <textarea
              id="regen-content-direction"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              placeholder="e.g. Rewrite the hero subtitle to emphasize speed and clarity"
              className="min-h-32 rounded-md border border-(--bor2) bg-(--bg) p-2 text-xs"
              disabled={streaming}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1">
          <Label>AI response</Label>
          <pre className="max-h-48 overflow-auto rounded-md border border-(--bor2) bg-(--sur1) p-2 font-mono text-[11px] leading-snug">
            {response || (streaming ? 'Streaming…' : '(click Generate)')}
          </pre>
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
            data-testid="regen-content-apply"
          >
            {updateMutation.isPending ? 'Applying…' : `Apply to ${FILE_NAME}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
