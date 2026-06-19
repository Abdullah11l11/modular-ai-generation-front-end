import { useCssProperties, type CssPropertyWithValue } from '@/features/editor/hooks/useCssProperties';
import { useCssPropertyUpdates } from '@/features/editor/hooks/useCssPropertyUpdates';
import { THEME_PROPERTIES } from '@/features/editor/types/cssProperties';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { Id, ProjectFile } from '@/types/api';

type ThemeTabProps = {
  projectId: Id;
  styleFile: ProjectFile | null;
};

export function ThemeTab({ projectId, styleFile }: ThemeTabProps) {
  const content = styleFile?.content ?? '';
  const { groups } = useCssProperties(content, [THEME_PROPERTIES]);
  const { update } = useCssPropertyUpdates({
    projectId,
    fileId: styleFile?.id ?? null,
    content,
  });

  const group = groups[0];
  if (!group) return null;

  return (
    <div className="flex flex-col gap-3 p-3">
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

          {prop.type === 'font' && (
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
  );
}
