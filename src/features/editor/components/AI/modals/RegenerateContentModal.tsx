/**
 * Regenerate Content — pop-out modal that rewrites slide text.
 *
 * Self-contained module that mirrors the Structure modal's pattern.
 * Two scopes:
 *   - **whole**: AI emits a flat `{key: newValue}` map covering any
 *     `data-field` keys across every slide; the modal then walks each
 *     affected slide and updates its `data-field` element text in
 *     place, then writes `data.json` so PPTX export + content-var
 *     injection see the same values.
 *   - **current**: AI only sees keys that belong to the selected
 *     slide; sibling slides are not modified. Same write path, but
 *     `affectedSlides` is at most one file.
 *
 * Why this is needed: slides use `data-field="key"` with hardcoded
 * text content. The previous version only updated `data.json`, so
 * users thought "apply did nothing" because the on-screen slide
 * still showed the old copy. Now we apply the change directly to the
 * slide HTML via `updateDataField`.
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
import { useEditorContext } from '@/features/editor/hooks/useEditorStore';
import { TASK_REGENERATE_CONTENT_PROMPT } from '@/lib/ai/prompts';
import { extractDataFields, updateDataField } from '@/features/editor/utils/dataFields';
import { parseJsonBlock } from '@/lib/ai/responseParsers';
import { minimaxService } from '@/lib/ai/providers/minimax';
import type { ProjectFile } from '@/types/api';

type Props = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Scope = 'whole' | 'current';

const FILE_NAME = 'data.json';
const PREFERRED_PROVIDER_KEY = 'mgf.ai.preferredProviderId';
const readPreferredProviderId = (): string | null =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(PREFERRED_PROVIDER_KEY);

type ParsedChanges = Record<string, string>;

/**
 * Walk every slide HTML in `files` and group their `data-field` keys.
 * The result tells the modal which slide owns each key — required for
 * the per-slide apply path and for the diff preview.
 */
function indexDataFieldsBySlide(
  files: ProjectFile[],
): Map<string, Map<string, string>> {
  // map: slide fileId → (data-field key → current text value)
  const out = new Map<string, Map<string, string>>();
  for (const f of files) {
    if (f.layer !== 'slide' || !f.name.endsWith('.html')) continue;
    const fields = extractDataFields(f.content ?? '');
    const inner = new Map<string, string>();
    for (const fd of fields) inner.set(fd.key, fd.value);
    out.set(f.id, inner);
  }
  return out;
}

/**
 * Apply a `{key: newValue}` map to the right slide HTMLs.
 *
 * For every key in `changes`, find the slide(s) that declare a
 * `data-field="key"` attribute and rewrite its text content. Returns:
 *   - `affectedFiles`: fileId → new HTML (one entry per slide that
 *     had at least one key updated),
 *   - `unmatchedKeys`: keys the model emitted but no slide claims —
 *     surfaced to the user as a warning so they know the value went
 *     nowhere.
 */
function applyChangesToSlides(
  slideFiles: ProjectFile[],
  fieldIndex: Map<string, Map<string, string>>,
  changes: ParsedChanges,
): { affectedFiles: Map<string, string>; unmatchedKeys: string[] } {
  const affected = new Map<string, string>();
  const unmatched: string[] = [];
  // Reverse index: data-field key → slide fileIds that own it.
  const ownersByKey = new Map<string, string[]>();
  for (const [fileId, fields] of fieldIndex.entries()) {
    for (const key of fields.keys()) {
      const list = ownersByKey.get(key) ?? [];
      list.push(fileId);
      ownersByKey.set(key, list);
    }
  }
  for (const [key, value] of Object.entries(changes)) {
    const owners = ownersByKey.get(key);
    if (!owners || owners.length === 0) {
      unmatched.push(key);
      continue;
    }
    for (const fileId of owners) {
      const file = slideFiles.find((s) => s.id === fileId);
      if (!file) continue;
      const current = affected.get(fileId) ?? file.content ?? '';
      const next = updateDataField(current, key, value);
      affected.set(fileId, next);
    }
  }
  return { affectedFiles: affected, unmatchedKeys: unmatched };
}

export function RegenerateContentModal({ projectId, open, onOpenChange }: Props) {
  const { state } = useEditorContext();
  const { data: filesResponse } = useProjectFiles(projectId);
  const files = filesResponse?.data ?? [];

  const slideFiles = useMemo(
    () =>
      files
        .filter((f: ProjectFile) => f.layer === 'slide' && f.name.endsWith('.html'))
        .sort((a: ProjectFile, b: ProjectFile) => a.name.localeCompare(b.name)),
    [files],
  );

  // Selected slide = state.selectedSlideId, fallback to first.
  const currentSlide = useMemo(() => {
    if (!state.selectedSlideId) return slideFiles[0] ?? null;
    return (
      slideFiles.find((f: ProjectFile) => f.id === state.selectedSlideId) ?? slideFiles[0] ?? null
    );
  }, [slideFiles, state.selectedSlideId]);

  // Index every slide's data-field keys for fast ownership lookup.
  const fieldIndex = useMemo(() => indexDataFieldsBySlide(files), [files]);

  // The full data.json content (read-only — the modal writes the new
  // content as a flat map, not as a schema-preserving rewrite).
  const dataFile = files.find((f) => f.layer === 'content' && f.name === FILE_NAME);
  const dataJsonContent = dataFile?.content ?? '';

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(() =>
    readPreferredProviderId(),
  );

  const updateMutation = useUpdateProjectFile();
  const queryClient = useQueryClient();

  const [scope, setScope] = useState<Scope>('whole');
  const [direction, setDirection] = useState('');
  const [response, setResponse] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedChanges, setParsedChanges] = useState<ParsedChanges | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Reset state when the modal opens so a stale response can't leak.
  useEffect(() => {
    if (open) {
      setScope('whole');
      setDirection('');
      setResponse('');
      setStreaming(false);
      setError(null);
      setParsedChanges(null);
      setSelectedProviderId(readPreferredProviderId());
    } else {
      abortRef.current?.abort();
      abortRef.current = null;
    }
  }, [open]);

  // For the "current" scope, only ship keys the selected slide owns.
  const scopedKeys = useMemo(() => {
    if (scope === 'whole') {
      const all = new Set<string>();
      for (const m of fieldIndex.values()) for (const k of m.keys()) all.add(k);
      return [...all].sort();
    }
    if (!currentSlide) return [];
    const inner = fieldIndex.get(currentSlide.id);
    return inner ? [...inner.keys()].sort() : [];
  }, [scope, fieldIndex, currentSlide]);

  // Pre-compute the apply plan so the modal can show the user exactly
  // what will change before they hit Apply.
  const applyPlan = useMemo(() => {
    if (!parsedChanges) return null;
    const { affectedFiles, unmatchedKeys } = applyChangesToSlides(
      slideFiles,
      fieldIndex,
      parsedChanges,
    );
    const affectedCount = affectedFiles.size;
    const updatedDataJson = parsedChanges
      ? { ...(safeParse(dataJsonContent) ?? {}), ...parsedChanges }
      : null;
    return { affectedFiles, unmatchedKeys, affectedCount, updatedDataJson };
  }, [parsedChanges, slideFiles, fieldIndex, dataJsonContent]);

  const handleGenerate = async () => {
    if (!direction.trim() || streaming) return;
    if (!selectedProviderId) {
      setError('No AI provider selected. Open Settings → AI Providers to add one.');
      return;
    }
    if (scope === 'current' && !currentSlide) {
      setError('No slide selected. Pick a slide in the library first.');
      return;
    }
    setStreaming(true);
    setError(null);
    setResponse('');
    setParsedChanges(null);

    // Build the scope context. For 'whole' we don't ship every slide's
    // full HTML (that's noise); we ship a short key index so the AI
    // can see which keys exist without bloating the prompt.
    const userMessageLines: string[] = [direction.trim(), '', `<scope>${scope}</scope>`];

    if (scope === 'current' && currentSlide) {
      const fields = fieldIndex.get(currentSlide.id) ?? new Map();
      userMessageLines.push(
        '',
        `<target-slide name="${currentSlide.name}">`,
        `keys: ${[...fields.keys()].join(', ') || '(none)'}`,
        '</target-slide>',
      );
    } else {
      const summary = slideFiles
        .map((s) => {
          const fields = fieldIndex.get(s.id) ?? new Map();
          return `${s.name}: ${[...fields.keys()].join(', ') || '(no data-field)'}`;
        })
        .join('\n');
      userMessageLines.push('', '<all-slides-key-index>', summary, '</all-slides-key-index>');
    }

    userMessageLines.push(
      '',
      '<required-data-keys>',
      scopedKeys.length ? scopedKeys.join(', ') : '(none — nothing to change)',
      '</required-data-keys>',
      '',
      `<current-file-content name="${FILE_NAME}" layer="content">`,
      dataJsonContent,
      '</current-file-content>',
    );

    const userMessage = userMessageLines.join('\n');
    let assistant = '';
    const controller = new AbortController();
    abortRef.current = controller;

    await minimaxService.streamChat(
      {
        model: 'MiniMax-M3',
        system: TASK_REGENERATE_CONTENT_PROMPT,
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
                ? "The model didn't return a ```json code block. Try rephrasing or use a larger model."
                : `Invalid JSON from the model: ${parsed.error}`,
            );
            return;
          }
          if (!parsed.value || typeof parsed.value !== 'object' || Array.isArray(parsed.value)) {
            setError('Expected a flat {key: value} object from the model.');
            return;
          }
          // Coerce every value to string and drop non-scalar entries —
          // the renderer only ever substitutes text into a data-field
          // element so an object/array value is meaningless.
          const flat: ParsedChanges = {};
          for (const [k, v] of Object.entries(parsed.value as Record<string, unknown>)) {
            if (v == null) continue;
            flat[k] = typeof v === 'string' ? v : String(v);
          }
          if (Object.keys(flat).length === 0) {
            setError('Model returned an empty change set. Try a more specific direction.');
            return;
          }
          setParsedChanges(flat);
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
    if (!parsedChanges || !applyPlan) return;
    const { affectedFiles, unmatchedKeys } = applyPlan;

    try {
      // 1. Update every affected slide HTML with the new data-field
      //    values. PUT per slide so the editor view reflects each
      //    change immediately.
      const slideUpdates: Promise<unknown>[] = [];
      for (const [fileId, content] of affectedFiles.entries()) {
        slideUpdates.push(
          updateMutation.mutateAsync({
            projectId,
            fileId,
            payload: { content },
          }),
        );
      }

      // 2. Update data.json so PPTX export + content-var injection
      //    see the same values the slides now show.
      if (dataFile) {
        const merged = { ...(safeParse(dataJsonContent) ?? {}), ...parsedChanges };
        slideUpdates.push(
          updateMutation.mutateAsync({
            projectId,
            fileId: dataFile.id,
            payload: { content: JSON.stringify(merged, null, 2) },
          }),
        );
      }

      await Promise.all(slideUpdates);
      await queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'files'],
      });

      const slideWord = affectedFiles.size === 1 ? 'slide' : 'slides';
      const keyWord = Object.keys(parsedChanges).length === 1 ? 'key' : 'keys';
      let summary = `Applied ${Object.keys(parsedChanges).length} ${keyWord} to ${affectedFiles.size} ${slideWord}.`;
      if (unmatchedKeys.length > 0) {
        summary += ` (${unmatchedKeys.length} unmatched key${unmatchedKeys.length === 1 ? '' : 's'} ignored)`;
      }
      toast.success(summary);
      onOpenChange(false);
    } catch (err) {
      toast.error(`Apply failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    }
  };

  const handleDiscard = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[99vw]! w-[99vw]! max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Regenerate Content</DialogTitle>
          <DialogDescription>
            Rewrite slide text. The AI emits a flat{' '}
            <span className="font-mono">{'{key: value}'}</span> map; the modal then patches every
            matching <span className="font-mono">data-field</span> element inside the affected
            slide HTML(s) and writes <span className="font-mono">data.json</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1 text-xs">
            <input
              type="radio"
              name="regen-content-scope"
              value="whole"
              checked={scope === 'whole'}
              onChange={() => setScope('whole')}
              disabled={streaming}
            />
            <span>Whole project ({scopedKeys.length} keys)</span>
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="radio"
              name="regen-content-scope"
              value="current"
              checked={scope === 'current'}
              onChange={() => setScope('current')}
              disabled={streaming || !currentSlide}
            />
            <span>
              Current slide only ({scopedKeys.length} keys
              {currentSlide ? ` in ${currentSlide.name}` : ', no slide selected'})
            </span>
          </label>
        </div>

        {scopedKeys.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 rounded-md border border-(--bor2) bg-(--sur1) p-2 text-[11px]">
            <span className="font-medium">In-scope keys:</span>
            {scopedKeys.map((k) => (
              <code key={k} className="rounded bg-(--bg) px-1 py-0.5 font-mono">
                {k}
              </code>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <Label>Current {FILE_NAME}</Label>
            <pre className="max-h-[60vh] min-h-48 overflow-auto rounded-md border border-(--bor2) bg-(--sur1) p-2 font-mono text-[11px] leading-snug">
              {dataJsonContent || '(empty)'}
            </pre>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="regen-content-direction">Your direction</Label>
            <textarea
              id="regen-content-direction"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              placeholder={
                scope === 'current'
                  ? 'e.g. Rewrite the title to emphasize speed; shorten the body to two sentences'
                  : 'e.g. Make every title punchier and replace buzzwords with concrete numbers'
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

        {applyPlan && (
          <div
            className="flex flex-col gap-2 rounded-md border border-(--bor2) bg-(--sur1) p-3 text-[12px]"
            data-testid="regen-content-plan"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-(--cy)">
                {applyPlan.affectedCount} slide{applyPlan.affectedCount === 1 ? '' : 's'}
              </span>
              <span>will be updated.</span>
              {applyPlan.unmatchedKeys.length > 0 && (
                <span className="text-(--t3)">
                  ⚠ {applyPlan.unmatchedKeys.length} unmatched key
                  {applyPlan.unmatchedKeys.length === 1 ? '' : 's'}:{' '}
                  {applyPlan.unmatchedKeys.map((k) => (
                    <code key={k} className="ml-1 rounded bg-(--bg) px-1 font-mono">
                      {k}
                    </code>
                  ))}
                </span>
              )}
            </div>
            <ul className="flex flex-wrap gap-1 text-[11px]">
              {Object.entries(parsedChanges ?? {}).map(([k, v]) => (
                <li key={k} className="flex items-baseline gap-1">
                  <code className="rounded bg-(--bg) px-1 font-mono">{k}</code>
                  <span className="text-(--t3)">→</span>
                  <span className="max-w-[40ch] truncate text-(--t2)">{v}</span>
                </li>
              ))}
            </ul>
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
            disabled={
              !parsedChanges ||
              !applyPlan ||
              applyPlan.affectedCount === 0 ||
              updateMutation.isPending
            }
            data-testid="regen-content-apply"
          >
            {updateMutation.isPending
              ? 'Applying…'
              : applyPlan
                ? `Apply to ${applyPlan.affectedCount} slide${applyPlan.affectedCount === 1 ? '' : 's'}`
                : 'Generate first'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Parse JSON safely — returns `null` on any error. */
function safeParse(text: string): Record<string, unknown> | null {
  try {
    const v = JSON.parse(text);
    if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
}