/**
 * Regenerate Content — pop-out modal that asks the AI to rewrite `data.json`.
 *
 * Self-contained module, mirrors the modular pattern from
 * `RegenerateStyleModal`. To keep the slide preview in sync after the
 * user applies the new content, the modal:
 *   1. Ships the current slide HTMLs + data.json + layout.css into the
 *      prompt so the AI can SEE which `{{key}}` placeholders exist and
 *      what classes / slots they target.
 *   2. Computes a key-level diff (added / removed / changed) between the
 *      old and new JSON and surfaces it in the response pane — without
 *      this check users think "nothing changed" because the slide still
 *      shows fallback text when a key was dropped.
 *   3. Builds a `Proposal` with `override.kind = 'content'` so the
 *      preview canvas re-renders the live slide with the new data.
 *   4. Writes the file on Apply + invalidates the React Query cache so
 *      the editor view picks up the new content immediately.
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
import { useUpdateProjectFile } from '@/features/files/hooks/useUpdateProjectFile';
import { useEditorContext, type Proposal } from '@/features/editor/hooks/useEditorStore';
import { TASK_REGENERATE_CONTENT_PROMPT } from '@/lib/ai/prompts';
import { parseJsonBlock } from '@/lib/ai/responseParsers';
import { minimaxService } from '@/lib/ai/providers/minimax';
import type { ProjectFile } from '@/types/api';

type Props = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const FILE_NAME = 'data.json';
const PREFERRED_PROVIDER_KEY = 'mgf.ai.preferredProviderId';
const readPreferredProviderId = (): string | null =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(PREFERRED_PROVIDER_KEY);

/** Recursively gather every dotted JSON path so we can diff old vs new. */
function collectPaths(value: unknown, prefix = ''): Set<string> {
  const out = new Set<string>();
  if (value === null || typeof value !== 'object') {
    if (prefix) out.add(prefix);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      collectPaths(item, `${prefix}[${i}]`).forEach((p) => out.add(p));
    });
    if (!prefix) out.add('');
    return out;
  }
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    collectPaths(v, path).forEach((p) => out.add(p));
  }
  return out;
}

/** Pull every `{{key}}` placeholder out of slide HTML so the prompt
 *  can tell the AI which keys MUST remain. */
function collectPlaceholders(html: string): string[] {
  const out = new Set<string>();
  const re = /\{\{([\w.-]+)\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) out.add(m[1]);
  return [...out].sort();
}

function diffKeys(
  oldText: string,
  newText: string,
): { added: string[]; removed: string[]; changed: number; unchanged: number } {
  let oldData: unknown;
  let newData: unknown;
  try {
    oldData = JSON.parse(oldText);
  } catch {
    oldData = null;
  }
  try {
    newData = JSON.parse(newText);
  } catch {
    newData = null;
  }
  const oldPaths = oldData ? collectPaths(oldData) : new Set<string>();
  const newPaths = newData ? collectPaths(newData) : new Set<string>();
  const added: string[] = [];
  const removed: string[] = [];
  for (const p of newPaths) if (!oldPaths.has(p)) added.push(p);
  for (const p of oldPaths) if (!newPaths.has(p)) removed.push(p);
  // Crude value-level diff: count paths whose stringified value differs.
  let changed = 0;
  let unchanged = 0;
  for (const p of oldPaths) {
    if (!newPaths.has(p)) continue;
    const a = JSON.stringify(getByPath(oldData, p));
    const b = JSON.stringify(getByPath(newData, p));
    if (a === b) unchanged++;
    else changed++;
  }
  return { added, removed, changed, unchanged };
}

function getByPath(value: unknown, path: string): unknown {
  const m = path.match(/^\[(\d+)\]$/);
  if (m) return Array.isArray(value) ? value[parseInt(m[1], 10)] : undefined;
  const parts = path.split('.');
  let cur: unknown = value;
  for (const p of parts) {
    const arrMatch = p.match(/^(\w+)\[(\d+)\]$/);
    if (arrMatch && cur && typeof cur === 'object') {
      cur = (cur as Record<string, unknown>)[arrMatch[1]];
      if (Array.isArray(cur)) cur = cur[parseInt(arrMatch[2], 10)];
    } else if (cur && typeof cur === 'object') {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

export function RegenerateContentModal({ projectId, open, onOpenChange }: Props) {
  const { state, dispatch } = useEditorContext();
  const { data: filesResponse } = useProjectFiles(projectId);
  const files = filesResponse?.data ?? [];
  const current = files.find((f) => f.layer === 'content' && f.name === FILE_NAME);
  const currentContent = current?.content ?? '';

  // Sibling files for the prompt context: slide HTMLs (so the AI can
  // see which `{{key}}` placeholders the slide expects) and layout.css
  // (so it knows the visual contract). These are read-only here — we
  // don't write them in this modal.
  const slideHtmls = useMemo(
    () =>
      files
        .filter((f: ProjectFile) => f.layer === 'slide' && f.name.endsWith('.html'))
        .map((f: ProjectFile) => ({ name: f.name, content: f.content ?? '' })),
    [files],
  );
  const placeholderKeys = useMemo(
    () =>
      [...new Set(slideHtmls.flatMap((s) => collectPlaceholders(s.content)))].sort(),
    [slideHtmls],
  );

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
      '<required-data-keys>',
      // `{{key}}` placeholders the slide HTMLs reference. The AI MUST
      // keep emitting values for every one of these (or the slide
      // renders fallback text and looks unchanged).
      placeholderKeys.length ? placeholderKeys.join(', ') : '(none — free to invent)',
      '</required-data-keys>',
      '',
      `<current-file-content name="${FILE_NAME}" layer="content">`,
      currentContent,
      '</current-file-content>',
      '',
      '<slide-html-context>',
      ...slideHtmls.map((s) => `--- ${s.name} ---\n${s.content}`),
      '</slide-html-context>',
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

  // Live diff between current data.json and the proposed preview.
  const diff = useMemo(
    () => (previewContent ? diffKeys(currentContent, previewContent) : null),
    [previewContent, currentContent],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[99vw] w-[99vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Regenerate Content</DialogTitle>
          <DialogDescription>
            Rewrite <span className="font-mono">data.json</span>. The preview canvas re-renders
            the live slide with the new data substituted in so you can see the change applied
            before saving. Keep all <span className="font-mono">{'{{key}}'}</span> placeholders
            listed below or the slide will fall back to placeholder text.
          </DialogDescription>
        </DialogHeader>

        {placeholderKeys.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 rounded-md border border-(--bor2) bg-(--sur1) p-2 text-[11px]">
            <span className="font-medium">Required keys:</span>
            {placeholderKeys.map((k) => (
              <code key={k} className="rounded bg-(--bg) px-1 py-0.5 font-mono">
                {`{{${k}}}`}
              </code>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <Label>Current data.json</Label>
            <pre className="max-h-[60vh] min-h-48 overflow-auto rounded-md border border-(--bor2) bg-(--sur1) p-2 font-mono text-[11px] leading-snug">
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

        {diff && (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-(--bor2) bg-(--sur1) p-2 text-[11px]">
            <span>
              <span className="font-semibold text-(--cy)">{diff.changed}</span> changed
            </span>
            <span>
              <span className="font-semibold text-(--t2)">{diff.unchanged}</span> unchanged
            </span>
            <span>
              <span className="font-semibold text-(--gn)">+{diff.added.length}</span> added
            </span>
            <span>
              <span className="font-semibold text-destructive">-{diff.removed.length}</span> removed
            </span>
            {diff.removed.length > 0 && (
              <span className="text-destructive">
                ⚠ Some keys were dropped — slide may render fallback text.
              </span>
            )}
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