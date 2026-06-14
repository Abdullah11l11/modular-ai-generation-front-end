import { useRef, useCallback } from 'react';
import { useUpdateProjectFile } from '@/features/files/hooks/useUpdateProjectFile';
import type { Id } from '@/types/api';

export function replaceCssVariable(content: string, varName: string, newValue: string): string {
  const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped}\\s*:\\s*)[^;]+;`);

  if (regex.test(content)) {
    return content.replace(regex, `$1${newValue};`);
  }

  const rootMatch = content.match(/(:root\s*\{[^}]*)\}/s);
  if (rootMatch) {
    const before = rootMatch[1];
    const after = content.slice(rootMatch.index! + rootMatch[0].length);
    const indentMatch = before.match(/\n(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '  ';
    return before + `\n${indent}${varName}: ${newValue};` + '}' + after;
  }

  return content + `\n:root {\n  ${varName}: ${newValue};\n}\n`;
}

export function useCssPropertyUpdates(
  projectId: Id,
  fileId: Id | null,
  currentContent: string,
) {
  const mutation = useUpdateProjectFile();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateProperty = useCallback(
    (varName: string, newValue: string) => {
      if (!fileId) return;

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        const updatedContent = replaceCssVariable(currentContent, varName, newValue);
        mutation.mutate({ projectId, fileId, payload: { content: updatedContent } });
      }, 500);
    },
    [projectId, fileId, currentContent, mutation],
  );

  return {
    updateProperty,
    isSaving: mutation.isPending,
  };
}
