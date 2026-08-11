import { useMemo, useState } from 'react';
import {
  extractDataFields,
  updateDataField,
  labelForField,
  isLongTextField,
  type DataField,
} from '@/features/editor/utils/dataFields';

type ContentTabProps = {
  fileContent: string;
  fileId: string;
  onUpdate: (fileId: string, content: string) => void;
};

/**
 * The Content tab extracts every element with a `data-field` attribute
 * from the slide HTML and surfaces one editable input per unique key.
 * Edits route back through `onUpdate` and replace the element's text
 * content — the surrounding markup is left untouched so the preview
 * keeps reflecting live changes.
 *
 * The previous version exposed the raw HTML in a textarea. That works
 * for engineering users but is bad UX for everyone else: the HTML is
 * full of structural markup that isn't actually the content the user
 * wants to change.
 *
 * For projects that use a `data.json` content layer (UVCP), the same
 * fields appear in both the HTML and the JSON. The preview renderer
 * reads the HTML directly, so writing back to HTML keeps everything in
 * sync. Syncing the JSON file is a separate problem (out of scope for
 * this fix) — the structure is the priority.
 *
 * If the slide has no `data-field` elements at all, fall back to a
 * brief "no fields detected" message with a button that switches to
 * the raw HTML view.
 */
export function ContentTab({ fileContent, fileId, onUpdate }: ContentTabProps) {
  const fields = useMemo(() => extractDataFields(fileContent), [fileContent]);
  const [showRaw, setShowRaw] = useState(false);

  if (showRaw) {
    return (
      <div className="flex h-full flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-(--t2) uppercase tracking-wider">
            Slide HTML (raw)
          </span>
          <button
            type="button"
            onClick={() => setShowRaw(false)}
            className="text-(--cy) text-[11px] underline underline-offset-2"
          >
            Back to fields
          </button>
        </div>
        <textarea
          value={fileContent}
          onChange={(e) => onUpdate(fileId, e.target.value)}
          spellCheck={false}
          className="min-h-[280px] w-full flex-1 resize-y rounded-md border border-(--bor2) bg-(--sur) p-2 font-mono text-[11px] leading-relaxed text-(--t1) outline-none focus:border-(--cy)"
        />
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="flex h-full flex-col gap-3">
        <p className="text-(--t3) text-xs">
          No <code className="font-mono">data-field</code> elements detected in this slide. Add
          them to the HTML so the editor can surface editable inputs per field.
        </p>
        <button
          type="button"
          onClick={() => setShowRaw(true)}
          className="self-start rounded-md border border-(--bor2) px-2 py-1 text-(--cy) text-xs"
        >
          Edit raw HTML
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-(--t2) uppercase tracking-wider">
          Slide content
        </span>
        <div className="flex items-center gap-2">
          <span className="text-(--t3) text-[11px]">{fields.length} fields</span>
          <button
            type="button"
            onClick={() => setShowRaw(true)}
            className="text-(--cy) text-[11px] underline underline-offset-2"
          >
            Raw HTML
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {fields.map((field) => (
          <FieldInput
            key={field.key}
            field={field}
            onChange={(next) => {
              const updated = updateDataField(fileContent, field.key, next);
              onUpdate(fileId, updated);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FieldInput({
  field,
  onChange,
}: {
  field: DataField;
  onChange: (next: string) => void;
}) {
  const long = isLongTextField(field.tagName);
  const label = labelForField(field.key);
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-center justify-between">
        <span className="text-(--t3) text-[11px]">{label}</span>
        <code className="text-(--t3) text-[10px]">{field.tagName}</code>
      </span>
      {long ? (
        <textarea
          value={field.value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          spellCheck={false}
          className="w-full resize-y rounded-md border border-(--bor2) bg-(--sur) p-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
        />
      ) : (
        <input
          type="text"
          value={field.value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-full rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
        />
      )}
    </label>
  );
}
