import { useRef, useCallback, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateProjectFile } from '@/features/files/hooks/useUpdateProjectFile';
import type { ProjectFile } from '@/types/api';

/** Debounce window between the user's last keystroke and the actual
 *  backend PUT. 150 ms is short enough that the panel feels live
 *  (the user types the next character before they could notice) but
 *  long enough to coalesce rapid edits to the same field. */
const DEBOUNCE_MS = 150;

/** How long the "Saved" pill stays visible after a successful PUT
 *  before reverting to the idle state. */
const SAVED_VISIBLE_MS = 1500;

export type SaveStatus = 'idle' | 'pending' | 'saved';

export function replaceCssVariable(content: string, key: string, value: string): string {
  const cssVar = `--${key}`;
  const regex = new RegExp(`(${cssVar}\\s*:\\s*)[^;]+`);

  if (regex.test(content)) {
    return content.replace(regex, `$1${value}`);
  }

  if (content.includes(':root')) {
    return content.replace(/(:root\s*\{)/, `$1\n  ${cssVar}: ${value};`);
  }

  return `:root {\n  ${cssVar}: ${value};\n}\n\n${content}`;
}

export function useCssPropertyUpdates(projectId: string) {
  const updateMutation = useUpdateProjectFile();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<{ fileId: string; content: string } | null>(null);
  const queryClient = useQueryClient();

  // Save-status tracking. The visual state in the panel header reads
  // from `status`; we keep it in a useState so re-renders happen when
  // it flips. The timer refs drive the actual transitions.
  const [status, setStatus] = useState<SaveStatus>('idle');
  const savedClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending timers on unmount so we don't fire a stale
  // mutation or set state on an unmounted component.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (savedClearRef.current) clearTimeout(savedClearRef.current);
    };
  }, []);

  const scheduleUpdate = useCallback(
    (fileId: string, content: string) => {
      pendingRef.current = { fileId, content };

      // Optimistic update of the TanStack Query cache so the editor
      // canvas re-renders immediately, without waiting for the
      // debounce + PUT round-trip.
      queryClient.setQueryData(['projects', projectId, 'files'], (old: { data: ProjectFile[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((f) =>
            f.id === fileId ? { ...f, content } : f,
          ),
        };
      });

      // A new keystroke arrived — we're definitely "pending". Cancel
      // any prior "Saved → idle" countdown so the pill doesn't flip
      // off prematurely while the user is still typing.
      if (savedClearRef.current) {
        clearTimeout(savedClearRef.current);
        savedClearRef.current = null;
      }
      setStatus('pending');

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const pending = pendingRef.current;
        if (!pending) return;
        updateMutation.mutate(
          { projectId, fileId: pending.fileId, payload: { content: pending.content } },
          {
            onError: () => {
              pendingRef.current = null;
              queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'files'] });
              // On error we drop back to idle so the pill doesn't
              // spin forever. A more polished version could show an
              // "error" status; we leave that for the eventual
              // toast layer.
              setStatus('idle');
            },
            onSuccess: () => {
              pendingRef.current = null;
              queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'files'] });
              setStatus('saved');
              savedClearRef.current = setTimeout(() => {
                setStatus('idle');
                savedClearRef.current = null;
              }, SAVED_VISIBLE_MS);
            },
          },
        );
        timerRef.current = null;
      }, DEBOUNCE_MS);
    },
    [projectId, updateMutation, queryClient],
  );

  return { scheduleUpdate, status };
}
