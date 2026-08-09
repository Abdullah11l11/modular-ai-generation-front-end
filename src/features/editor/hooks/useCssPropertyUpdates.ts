import { useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateProjectFile } from '@/features/files/hooks/useUpdateProjectFile';
import type { ProjectFile } from '@/types/api';

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

  const scheduleUpdate = useCallback(
    (fileId: string, content: string) => {
      pendingRef.current = { fileId, content };

      queryClient.setQueryData(['projects', projectId, 'files'], (old: { data: ProjectFile[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((f) =>
            f.id === fileId ? { ...f, content } : f,
          ),
        };
      });

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const pending = pendingRef.current;
        if (!pending) return;
        updateMutation.mutate(
          { projectId, fileId: pending.fileId, payload: { content: pending.content } },
          {
            onError: () => {
              queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'files'] });
            },
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'files'] });
            },
          },
        );
        pendingRef.current = null;
      }, 500);
    },
    [projectId, updateMutation, queryClient],
  );

  return { scheduleUpdate, isPending: updateMutation.isPending };
}
