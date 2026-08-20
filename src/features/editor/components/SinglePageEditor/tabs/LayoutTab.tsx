import { useCssProperties } from '@/features/editor/hooks/useCssProperties';
import { useCssPropertyUpdates } from '@/features/editor/hooks/useCssPropertyUpdates';
import { THEME_PROPERTIES } from '@/features/editor/types/cssProperties';
import type { ProjectFile } from '@/types/api';

type LayoutTabProps = {
  projectId: string;
  layoutFile: ProjectFile | null;
};

export function LayoutTab({ projectId, layoutFile }: LayoutTabProps) {
  const { scheduleUpdate } = useCssPropertyUpdates(projectId);
  const content = layoutFile?.content ?? '';
  const { groups } = useCssProperties(content, THEME_PROPERTIES);

  if (!layoutFile) {
    return (
      <p className="text-xs text-(--t3)">
        No layout file — layout is only available when created from a template.
      </p>
    );
  }

  function updateValue(key: string, value: string) {
    if (!layoutFile) return;
    const regex = new RegExp(`(--${key}\\s*:\\s*)[^;]+`);
    const newContent = regex.test(content)
      ? content.replace(regex, `$1${value}`)
      : content.replace(/(:root\s*\{)/, `$1\n  --${key}: ${value};`);
    scheduleUpdate(layoutFile.id, newContent);
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-(--t2) uppercase tracking-wider">{group.label}</span>
          {group.properties.map((prop) => (
            <div key={prop.key} className="flex items-center justify-between gap-2">
              <label className="text-xs text-(--t3)">{prop.label}</label>
              {prop.type === 'color' ? (
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={prop.value}
                    onChange={(e) => updateValue(prop.key, e.target.value)}
                    className="size-6 cursor-pointer rounded border border-(--bor2)"
                  />
                  <span className="w-16 text-xs text-(--t3) font-mono">{prop.value}</span>
                </div>
              ) : prop.type === 'font' ? (
                <input
                  type="text"
                  value={prop.value}
                  onChange={(e) => updateValue(prop.key, e.target.value)}
                  className="h-7 w-32 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
                />
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
