import { useRef, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateProjectFile } from '@/features/files/hooks/useUpdateProjectFile';
import type { Id } from '@/types/api';

export function replaceCssVariable(content: string, varName: string, value: string): string {
  const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped}\\s*:\\s*)[^;]+;`);

  if (regex.test(content)) {
    return content.replace(regex, `$1${value};`);
  }

  const rootMatch = content.match(/(:root\s*\{)/);
  if (rootMatch) {
    const idx = content.indexOf(rootMatch[1]) + rootMatch[1].length;
    return content.slice(0, idx) + `\n  ${varName}: ${value};` + content.slice(idx);
  }

  return `:root {\n  ${varName}: ${value};\n}\n${content}`;
}

export function useCssPropertyUpdates({
  projectId,
  fileId,
  content,
}: {
  projectId: Id;
  fileId: Id | null;
  content: string;
}) {
  const updateFile = useUpdateProjectFile();
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<Map<string, string>>(new Map());
  const contentRef = useRef(content);
  contentRef.current = content;

  const update = useCallback(
    (varName: string, value: string) => {
      pendingRef.current.set(varName, value);

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        if (!fileId) return;
        const currentContent = contentRef.current;
        let updated = currentContent;
        for (const [key, val] of pendingRef.current) {
          updated = replaceCssVariable(updated, key, val);
        }
        updateFile.mutate(
          { projectId, fileId, payload: { content: updated } },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'files'] });
            },
          },
        );
        pendingRef.current.clear();
      }, 500);
    },
    [projectId, fileId, updateFile, queryClient],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { update, isPending: updateFile.isPending };
}
