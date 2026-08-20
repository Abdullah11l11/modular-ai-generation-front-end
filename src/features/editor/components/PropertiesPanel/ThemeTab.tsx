import { useCssProperties } from '@/features/editor/hooks/useCssProperties';
import { THEME_PROPERTIES, FONT_OPTIONS } from '@/features/editor/types/cssProperties';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ThemeTabProps = {
  fileContent: string;
  fileId: string;
  onUpdate: (fileId: string, content: string) => void;
};

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

export function ThemeTab({ fileContent, fileId, onUpdate }: ThemeTabProps) {
  const { groups } = useCssProperties(fileContent, THEME_PROPERTIES);

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
                    onChange={(e) => onUpdate(fileId, updateVar(fileContent, prop.key, e.target.value))}
                    className="size-6 cursor-pointer rounded border border-(--bor2)"
                  />
                  <span className="w-16 text-xs text-(--t3) font-mono">{prop.value}</span>
                </div>
              ) : prop.type === 'font' ? (
                <Select
                  value={prop.value}
                  onValueChange={(val) => onUpdate(fileId, updateVar(fileContent, prop.key, val))}
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
              ) : prop.type === 'spacing' || prop.type === 'border-radius' ? (
                <input
                  type="text"
                  value={prop.value}
                  onChange={(e) => onUpdate(fileId, updateVar(fileContent, prop.key, e.target.value))}
                  className="h-7 w-24 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
                />
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
