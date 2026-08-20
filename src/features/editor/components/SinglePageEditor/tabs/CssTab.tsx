import { useCssProperties } from '@/features/editor/hooks/useCssProperties';
import { useCssPropertyUpdates } from '@/features/editor/hooks/useCssPropertyUpdates';
import { THEME_PROPERTIES, FONT_OPTIONS } from '@/features/editor/types/cssProperties';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProjectFile } from '@/types/api';

type CssTabProps = {
  projectId: string;
  styleFile: ProjectFile | null;
};

export function CssTab({ projectId, styleFile }: CssTabProps) {
  const { scheduleUpdate } = useCssPropertyUpdates(projectId);
  const content = styleFile?.content ?? '';
  const { groups } = useCssProperties(content, THEME_PROPERTIES);

  if (!styleFile) {
    return <p className="text-xs text-(--t3)">No CSS file found.</p>;
  }

  function updateValue(key: string, value: string) {
    if (!styleFile) return;
    const regex = new RegExp(`(--${key}\\s*:\\s*)[^;]+`);
    const newContent = regex.test(content)
      ? content.replace(regex, `$1${value}`)
      : content.replace(/(:root\s*\{)/, `$1\n  --${key}: ${value};`);
    scheduleUpdate(styleFile.id, newContent);
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
                <Select
                  value={prop.value}
                  onValueChange={(val) => updateValue(prop.key, val)}
                >
                  <SelectTrigger className="w-32 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font} value={font} className="text-xs">{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : prop.type === 'size' ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={prop.value}
                    onChange={(e) => updateValue(prop.key, e.target.value)}
                    className="h-7 w-20 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
                  />
                  <span className="text-xs text-(--t3)">px/rem</span>
                </div>
              ) : prop.type === 'spacing' ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={prop.value}
                    onChange={(e) => updateValue(prop.key, e.target.value)}
                    className="h-7 w-20 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
                  />
                  <span className="text-xs text-(--t3)">px</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
