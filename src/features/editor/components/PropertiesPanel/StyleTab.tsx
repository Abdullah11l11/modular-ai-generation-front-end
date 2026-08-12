import { useCssProperties } from '@/features/editor/hooks/useCssProperties';
import { STYLE_PROPERTIES } from '@/features/editor/types/cssProperties';
import type { SaveStatus } from '@/features/editor/hooks/useCssPropertyUpdates';

/** Font presets exposed in the Style tab's font-family `<select>`.
 *  The labels are exactly the CSS `font-family` value's *first*
 *  token (i.e. the font name), which is what `resolveFontPreset`
 *  matches against when restoring the current selection from an
 *  already-persisted value. Cairo + Noto Sans Arabic are included
 *  for RTL / Arabic projects (see Tier 4). */
const FONT_PRESETS = [
  'Inter',
  'DM Sans',
  'Playfair Display',
  'JetBrains Mono',
  'Cairo',
  'Noto Sans Arabic',
] as const;

/** Full CSS font-family stack for each preset. The chosen family is
 *  always wrapped in single quotes (standard CSS practice for names
 *  with spaces) and followed by a platform-appropriate fallback.
 *  This is the literal value that ends up on the right-hand side
 *  of `--mgf-font-body: ...;`. */
const FONT_STACKS: Record<(typeof FONT_PRESETS)[number], string> = {
  Inter: "'Inter', system-ui, sans-serif",
  'DM Sans': "'DM Sans', system-ui, sans-serif",
  'Playfair Display': "'Playfair Display', Georgia, serif",
  'JetBrains Mono': "'JetBrains Mono', ui-monospace, monospace",
  Cairo: "'Cairo', 'Noto Sans Arabic', system-ui, sans-serif",
  'Noto Sans Arabic': "'Noto Sans Arabic', system-ui, sans-serif",
};

/** Pick the preset whose name appears at the start of a stored
 *  font-family stack (handles values like `'Inter', system-ui, sans-serif`
 *  by reading the first quoted token, then falls back to the bare
 *  first word). If nothing matches, defaults to the first preset so
 *  the `<select>` always shows a sensible selection. */
function resolveFontPreset(value: string): (typeof FONT_PRESETS)[number] {
  // First, try to capture the first quoted token as a whole — this
  // is the only way to recover names that contain a space (e.g.
  // 'Playfair Display', "DM Sans") without splitting on the
  // interior whitespace.
  const quoted = value.match(/^\s*['"]([^'"]+)['"]/);
  if (quoted && (FONT_PRESETS as readonly string[]).includes(quoted[1])) {
    return quoted[1] as (typeof FONT_PRESETS)[number];
  }
  // Fallback: bare first word, after stripping any trailing comma.
  // Won't match names with spaces, but at least handles the common
  // single-word case (e.g. "Inter").
  const bare = value.trim().split(/[,\s]/)[0]?.replace(/^["']|["']$/g, '');
  if (bare && (FONT_PRESETS as readonly string[]).includes(bare)) {
    return bare as (typeof FONT_PRESETS)[number];
  }
  return FONT_PRESETS[0];
}

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
  unit?: string;
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
          {prop.unit && <UnitHint unit={prop.unit} />}
        </div>
      );
    case 'line-height':
    case 'letter-spacing':
      return (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={prop.value}
            onChange={(e) => onUpdate(prop.key, e.target.value)}
            className="h-7 w-20 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
          />
          {prop.unit && <UnitHint unit={prop.unit} />}
        </div>
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
    case 'font': {
      // The dropdown shows preset NAMES but the value persisted to
      // :root is the full font-family stack (with the chosen family
      // wrapped in single quotes, the canonical CSS form). To survive
      // a round-trip from a value that's already a full stack, we
      // pick the preset whose name appears at the start of the stack.
      const current = resolveFontPreset(prop.value);
      return (
        <select
          value={current}
          onChange={(e) => onUpdate(prop.key, FONT_STACKS[e.target.value as keyof typeof FONT_STACKS])}
          className="h-7 w-36 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
        >
          {FONT_PRESETS.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      );
    }
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

/** Small non-editable badge shown next to numeric inputs to remind
 *  the user which CSS unit (rem, px, em, …) the token expects. The
 *  actual value still includes the unit verbatim — the badge is a
 *  hint, not part of the input. */
function UnitHint({ unit }: { unit: string }) {
  return (
    <span
      aria-hidden="true"
      className="font-mono text-[10px] text-(--t3) select-none"
    >
      {unit}
    </span>
  );
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

// Internal export so `__tests__/styleFontPreset.test.ts` can exercise
// the resolver without rendering the whole panel. Not re-exported
// from the module barrel — keep it panel-local.
export { resolveFontPreset, FONT_PRESETS };