import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCssProperties, type CssPropertyWithValue } from '@/features/editor/hooks/useCssProperties';
import { useCssPropertyUpdates } from '@/features/editor/hooks/useCssPropertyUpdates';
import { useUpdateProjectFile } from '@/features/files/hooks/useUpdateProjectFile';
import { CONTENT_PROPERTIES } from '@/features/editor/types/cssProperties';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toastSuccess } from '@/lib/toast';
import type { Id, ProjectFile } from '@/types/api';

const TEXT_FIELDS = ['title', 'subtitle', 'body'] as const;

function parseContentJson(content: string | null): Record<string, string> {
  if (!content) return { title: '', subtitle: '', body: '' };
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    return {
      title: typeof parsed.title === 'string' ? parsed.title : '',
      subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle : '',
      body: typeof parsed.body === 'string' ? parsed.body : '',
    };
  } catch {
    return { title: '', subtitle: '', body: '' };
  }
}

type ContentTabProps = {
  projectId: Id;
  slideContentFile: ProjectFile | null;
  slideStyleFile: ProjectFile | null;
  saveVersion: number;
};

export function ContentTab({ projectId, slideContentFile, slideStyleFile, saveVersion }: ContentTabProps) {
  const queryClient = useQueryClient();
  const slideCssContent = slideStyleFile?.content ?? '';
  const { groups } = useCssProperties(slideCssContent, [CONTENT_PROPERTIES]);
  const { update } = useCssPropertyUpdates({
    projectId,
    fileId: slideStyleFile?.id ?? null,
    content: slideCssContent,
  });

  const updateContentFile = useUpdateProjectFile();
  const contentFileId = slideContentFile?.id ?? null;
  const contentKey = `${projectId}-${contentFileId}`;

  const [values, setValues] = useState<Record<string, string>>(() =>
    parseContentJson(slideContentFile?.content ?? null),
  );

  useEffect(() => {
    const id = setTimeout(() => {
      setValues(parseContentJson(slideContentFile?.content ?? null));
    }, 0);
    return () => clearTimeout(id);
  }, [slideContentFile?.content, contentKey]);

  const prevSaveVersion = useRef(saveVersion);
  useEffect(() => {
    if (saveVersion === prevSaveVersion.current) return;
    prevSaveVersion.current = saveVersion;

    if (!contentFileId) return;

    const content = JSON.stringify(values);
    updateContentFile.mutate(
      { projectId, fileId: contentFileId, payload: { content } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'files'] });
          toastSuccess('Content saved');
        },
      },
    );
  }, [saveVersion, contentFileId, values, projectId, updateContentFile, queryClient]);

  const group = groups[0];

  function setField(field: string, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto p-3">
      <div className="flex flex-col gap-2 rounded-md border border-(--bor2) p-2">
        <span className="text-[10px] font-semibold text-(--t3) uppercase">Text Content</span>
        {TEXT_FIELDS.map((field) => (
          <div key={field} className="flex flex-col gap-0.5">
            <Label className="text-xs capitalize text-(--t2)">{field}</Label>
            <input
              type="text"
              value={values[field]}
              onChange={(e) => setField(field, e.target.value)}
              className="rounded-md border border-(--bor2) bg-(--bg) px-2 py-1 text-xs text-(--t1) outline-none focus:border-(--cy)"
              placeholder={`Enter ${field}...`}
            />
          </div>
        ))}
      </div>

      {group && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold text-(--t3) uppercase">Styling</span>
          {group.properties.map((prop: CssPropertyWithValue) => (
            <div key={prop.varName} className="flex flex-col gap-1">
              <Label className="text-xs text-(--t2)">{prop.label}</Label>

              {prop.type === 'color' && (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={prop.currentValue}
                    onChange={(e) => update(prop.varName, e.target.value)}
                    className="size-7 cursor-pointer rounded border border-(--bor2) bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={prop.currentValue}
                    onChange={(e) => update(prop.varName, e.target.value)}
                    className="flex-1 rounded-md border border-(--bor2) bg-(--bg) px-2 py-1 text-xs text-(--t1) outline-none focus:border-(--cy)"
                  />
                </div>
              )}

              {prop.type === 'size' && (
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={prop.min ?? 0}
                    max={prop.max ?? 4}
                    step={prop.step ?? 0.1}
                    value={parseFloat(prop.currentValue) || 0}
                    onChange={(e) => update(prop.varName, `${e.target.value}rem`)}
                    className="flex-1"
                  />
                  <input
                    type="text"
                    value={prop.currentValue}
                    onChange={(e) => update(prop.varName, e.target.value)}
                    className="w-14 rounded-md border border-(--bor2) bg-(--bg) px-2 py-1 text-xs text-(--t1) outline-none focus:border-(--cy)"
                  />
                </div>
              )}

              {prop.type === 'select' && (
                <Select value={prop.currentValue} onValueChange={(v) => update(prop.varName, v)}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(prop.options ?? []).map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
