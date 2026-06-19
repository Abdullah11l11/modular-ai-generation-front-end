import { useCssProperties, type CssPropertyWithValue } from '@/features/editor/hooks/useCssProperties';
import { useCssPropertyUpdates } from '@/features/editor/hooks/useCssPropertyUpdates';
import { STYLE_PROPERTIES } from '@/features/editor/types/cssProperties';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { Id, ProjectFile } from '@/types/api';

type StyleTabProps = {
  projectId: Id;
  layoutFile: ProjectFile | null;
};

export function StyleTab({ projectId, layoutFile }: StyleTabProps) {
  const content = layoutFile?.content ?? '';
  const { groups } = useCssProperties(content, [STYLE_PROPERTIES]);
  const { update } = useCssPropertyUpdates({
    projectId,
    fileId: layoutFile?.id ?? null,
    content,
  });

  const group = groups[0];
  if (!group) return null;

  return (
    <div className="flex flex-col gap-3 overflow-y-auto p-3">
      <span className="text-[10px] font-semibold text-(--t3) uppercase">Typography</span>

      {group.properties.map((prop: CssPropertyWithValue) => (
        <div key={prop.varName} className="flex flex-col gap-1">
          <Label className="text-xs text-(--t2)">{prop.label}</Label>

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

          {prop.type === 'slider' && (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={prop.min ?? 0}
                max={prop.max ?? 1}
                step={prop.step ?? 0.05}
                value={parseFloat(prop.currentValue) || 0}
                onChange={(e) => update(prop.varName, e.target.value)}
                className="flex-1"
              />
              <span className="w-8 text-right text-xs text-(--t3)">
                {parseFloat(prop.currentValue).toFixed(2)}
              </span>
            </div>
          )}

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
        </div>
      ))}
    </div>
  );
}
