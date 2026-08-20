import { useState, useEffect, useRef } from 'react';
import { useUpdateProjectFile } from '@/features/files/hooks/useUpdateProjectFile';
import { useQueryClient } from '@tanstack/react-query';
import type { ProjectFile } from '@/types/api';

type HtmlTabProps = {
  projectId: string;
  htmlFile: ProjectFile | null;
};

export function HtmlTab({ projectId, htmlFile }: HtmlTabProps) {
  const [value, setValue] = useState(htmlFile?.content ?? '');
  const updateMutation = useUpdateProjectFile();
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(htmlFile?.content ?? '');
  }, [htmlFile?.content]);

  function handleChange(newVal: string) {
    setValue(newVal);

    if (!htmlFile) return;

    queryClient.setQueryData(['projects', projectId, 'files'], (old: { data: ProjectFile[] } | undefined) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map((f) =>
          f.id === htmlFile.id ? { ...f, content: newVal } : f,
        ),
      };
    });

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      updateMutation.mutate(
        { projectId, fileId: htmlFile.id, payload: { content: newVal } },
        {
          onError: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'files'] });
          },
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'files'] });
          },
        },
      );
    }, 500);
  }

  if (!htmlFile) {
    return <p className="text-xs text-(--t3)">No HTML file found.</p>;
  }

  return (
    <textarea
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="min-h-64 w-full resize-none rounded-md border border-(--bor2) bg-(--bg) p-3 font-mono text-xs text-(--t1) outline-none focus:border-(--cy)"
    />
  );
}
