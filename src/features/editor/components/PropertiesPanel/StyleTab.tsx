import { useCssProperties } from '@/features/editor/hooks/useCssProperties';
import { STYLE_PROPERTIES } from '@/features/editor/types/cssProperties';
import type { SaveStatus } from '@/features/editor/hooks/useCssPropertyUpdates';

/**
 * Mutate a CSS variable in `:root`. If the variable already exists,
 * its value is replaced; otherwise a new declaration is inserted at
 * the top of the `:root` block. If there is no `:root` block at all,
 * one is created and prepended.
 *
 * Robust against common cases:
 * - Missing `:root` block (single-line projects, MGF default).
 * - Variable already declared (preserve source order).
 * - Multiple `:root` blocks (only the first is touched — kept simple).
 * - Comments inside `:root` (the regex is greedy enough that an
 *   existing `--key: value;` is replaced even if the value contains
 *   parentheses or commas).
 */
function updateVar(content: string, key: string, value: string): string {
  const regex = new RegExp(`(--${key}\\s*:\\s*)[^;]+`);
  if (regex.test(content)) {
    return content.replace(regex, `$1${value}`);
  }
  if (content.includes(':root')) {
    return content.replace(/(:root\s*\{)/, `$1\n  --${key}: ${value};`);
  }
  return `:root {\n  --${key}: ${value};\n}\n\n${content}`;
}

type StyleTabProps = {
  fileContent: string;
  fileId: string;
  /** Human-readable identifier for the file the panel is editing, e.g.
   *  `"style/style.css"`. Shown in the panel header so the user always
   *  knows whether they're touching the project theme or a per-slide
   *  override (per-slide projects have no separate file; both tabs
   *  edit the project-level `style.css`). */
  fileLabel: string;
  /** Save pipeline status — drives the "Saving…" / "Saved" pill. */
  saveStatus?: SaveStatus;
  onUpdate: (fileId: string, content: string) => void;
};

export function StyleTab({ fileContent, fileId, fileLabel, saveStatus, onUpdate }: StyleTabProps) {
  const { groups, hasVariables } = useCssProperties(fileContent, STYLE_PROPERTIES);

  function handleUpdate(key: string, value: string) {
    onUpdate(fileId, updateVar(fileContent, key, value));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2 rounded-md border border-(--bor2) bg-(--sur) px-2 py-1.5">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-(--t3)">Editing</div>
          <div className="font-mono text-xs text-(--t2)">{fileLabel}</div>
        </div>
        {saveStatus && saveStatus !== 'idle' && (
          <SaveStatusPill status={saveStatus} />
        )}
      </div>
      {!hasVariables && (
        <div className="rounded-md border border-dashed border-(--bor2) bg-(--sur)/50 px-3 py-2 text-xs text-(--t3)">
          Empty file — start with a <code className="font-mono text-(--t2)">:root { '{ … }' }</code> block. Changes you make here will create it automatically.
        </div>
      )}
      {groups.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-(--t2) uppercase tracking-wider">{group.label}</span>
          {group.properties.map((prop) => (
            <div key={prop.key} className="flex items-center justify-between gap-2">
              <label className="text-xs text-(--t3)">{prop.label}</label>
              {renderInput(prop, handleUpdate)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

type RenderInputProps = {
  key: string;
  label: string;
  type: import('@/features/editor/types/cssProperties').CssPropertyType;
  default: string;
  group: string;
  value: string;
  options?: string[];
};

function renderInput(prop: RenderInputProps, onUpdate: (key: string, value: string) => void) {
  switch (prop.type) {
    case 'size':
    case 'spacing':
    case 'border-radius':
      return (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={prop.value}
            onChange={(e) => onUpdate(prop.key, e.target.value)}
            className="h-7 w-24 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
          />
        </div>
      );
    case 'line-height':
    case 'letter-spacing':
      return (
        <input
          type="text"
          value={prop.value}
          onChange={(e) => onUpdate(prop.key, e.target.value)}
          className="h-7 w-20 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
        />
      );
    case 'weight':
      return (
        <select
          value={prop.value}
          onChange={(e) => onUpdate(prop.key, e.target.value)}
          className="h-7 w-20 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
        >
          {['100', '200', '300', '400', '500', '600', '700', '800', '900'].map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
      );
    default:
      return (
        <input
          type="text"
          value={prop.value}
          onChange={(e) => onUpdate(prop.key, e.target.value)}
          className="h-7 w-24 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
        />
      );
  }
}

/** Small status pill that mirrors `useCssPropertyUpdates`'s save
 *  state. Shown next to the file label so the user knows whether
 *  their last keystroke has been persisted. */
function SaveStatusPill({ status }: { status: SaveStatus }) {
  if (status === 'pending') {
    return (
      <span
        data-testid="style-save-status"
        className="inline-flex items-center gap-1 rounded-full bg-(--cy)/10 px-2 py-0.5 text-[10px] font-medium text-(--cy)"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--cy)" />
        Saving…
      </span>
    );
  }
  // status === 'saved'
  return (
    <span
      data-testid="style-save-status"
      className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Saved
    </span>
  );
}