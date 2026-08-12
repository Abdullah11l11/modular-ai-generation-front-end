import { useMemo, useState, useEffect, useRef } from 'react';
import { useUpdateProjectFile } from '@/features/files/hooks/useUpdateProjectFile';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { PlusIcon, XIcon } from 'lucide-react';
import { fixRTLText } from '@/features/editor/utils/rtlText';
import type { ProjectFile } from '@/types/api';

type ContentTabProps = {
  projectId: string;
  contentFile: ProjectFile | null;
};

const KNOWN_KEYS = ['title', 'subtitle', 'body'];

export function ContentTab({ projectId, contentFile }: ContentTabProps) {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [customKeys, setCustomKeys] = useState<string[]>([]);
  const updateMutation = useUpdateProjectFile();
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (contentFile?.content) {
      try {
        const parsed = JSON.parse(contentFile.content);
        const known: Record<string, string> = {};
        const custom: string[] = [];

        for (const [k, v] of Object.entries(parsed)) {
          if (KNOWN_KEYS.includes(k)) {
            known[k] = String(v);
          } else if (typeof v === 'string') {
            custom.push(k);
            known[k] = String(v);
          }
        }

        setFields(known);
        setCustomKeys(custom);
      } catch {
        setFields({ title: '', subtitle: '', body: '' });
        setCustomKeys([]);
      }
    } else {
      setFields({ title: '', subtitle: '', body: '' });
      setCustomKeys([]);
    }
  }, [contentFile?.content]);

  function buildJsonContent(updatedFields: Record<string, string>): string {
    const payload: Record<string, string> = {};
    for (const k of [...KNOWN_KEYS, ...customKeys]) {
      if (updatedFields[k] !== undefined) payload[k] = updatedFields[k];
    }
    return JSON.stringify(payload, null, 2);
  }

  function updateCache(contentJson: string) {
    if (!contentFile) return;
    queryClient.setQueryData(['projects', projectId, 'files'], (old: { data: ProjectFile[] } | undefined) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map((f) =>
          f.id === contentFile.id ? { ...f, content: contentJson } : f,
        ),
      };
    });
  }

  function scheduleSave(updatedFields: Record<string, string>) {
    if (!contentFile) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    const contentJson = buildJsonContent(updatedFields);
    updateCache(contentJson);

    timerRef.current = setTimeout(() => {
      updateMutation.mutate(
        { projectId, fileId: contentFile.id, payload: { content: contentJson } },
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

  function updateField(key: string, value: string) {
    const next = { ...fields, [key]: value };
    setFields(next);
    scheduleSave(next);
  }

  function addCustomKey() {
    const newKey = `field_${customKeys.length + 1}`;
    setCustomKeys([...customKeys, newKey]);
    const next = { ...fields, [newKey]: '' };
    setFields(next);
  }

  function removeCustomKey(key: string) {
    const nextCustom = customKeys.filter((k) => k !== key);
    setCustomKeys(nextCustom);
    const { [key]: _, ...rest } = fields;
    setFields(rest);
    scheduleSave(rest);
  }

  if (!contentFile) {
    return <p className="text-xs text-(--t3)">No content file found.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {KNOWN_KEYS.map((key) => (
        <BidiFieldInput
          key={key}
          label={key}
          displayLabel={key}
          value={fields[key] ?? ''}
          onChange={(v) => updateField(key, v)}
        />
      ))}

      {customKeys.map((key) => (
        <div key={key} className="flex items-center gap-1">
          <div className="flex flex-1 flex-col gap-1">
            <BidiFieldInput
              label={key}
              displayLabel={key}
              value={fields[key] ?? ''}
              onChange={(v) => updateField(key, v)}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="mt-4 size-6"
            onClick={() => removeCustomKey(key)}
          >
            <XIcon className="size-3" />
          </Button>
        </div>
      ))}

      <Button variant="outline" size="sm" className="gap-1" onClick={addCustomKey}>
        <PlusIcon className="size-3" />
        Add field
      </Button>
    </div>
  );
}

function BidiFieldInput({
  label,
  displayLabel,
  value,
  onChange,
}: {
  label: string;
  displayLabel: string;
  value: string;
  onChange: (next: string) => void;
}) {
  // Per-field dir decided by the first strong character of the value.
  // This matches the per-slide ContentTab behaviour so Arabic / English
  // input flows feel consistent across the editor.
  const dir = useMemo(() => fixRTLText(value), [value]);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-(--t3)">{displayLabel}</label>
      <input
        type="text"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        className="h-7 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
      />
    </div>
  );
}
