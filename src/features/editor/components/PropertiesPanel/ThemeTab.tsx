import { useCssProperties } from '@/features/editor/hooks/useCssProperties';
import { THEME_PROPERTIES, FONT_OPTIONS } from '@/features/editor/types/cssProperties';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ThemeTabProps = {
  fileContent: string;
  fileId: string;
  onUpdate: (fileId: string, content: string) => void;
};

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
                    onChange={(e) => {
                      const newContent = fileContent.replace(
                        new RegExp(`(--${prop.key}\\s*:\\s*)[^;]+`),
                        `$1${e.target.value}`,
                      );
                      onUpdate(fileId, newContent);
                    }}
                    className="size-6 cursor-pointer rounded border border-(--bor2)"
                  />
                  <span className="w-16 text-xs text-(--t3) font-mono">{prop.value}</span>
                </div>
              ) : prop.type === 'font' ? (
                <Select
                  value={prop.value}
                  onValueChange={(val) => {
                    const newContent = fileContent.replace(
                      new RegExp(`(--${prop.key}\\s*:\\s*)[^;]+`),
                      `$1${val}`,
                    );
                    onUpdate(fileId, newContent);
                  }}
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
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
