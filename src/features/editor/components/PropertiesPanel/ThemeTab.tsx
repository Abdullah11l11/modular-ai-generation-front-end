import { useCssProperties } from '@/features/editor/hooks/useCssProperties';
import { useCssPropertyUpdates } from '@/features/editor/hooks/useCssPropertyUpdates';
import { THEME_PROPERTIES, FONT_OPTIONS } from '@/features/editor/types/cssProperties';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { ProjectFile, Id } from '@/types/api';

type ThemeTabProps = {
  projectId: Id;
  styleFile: ProjectFile | null;
  hasElement: boolean;
};

function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer rounded border-2 border-(--bor2) bg-transparent p-0.5"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 flex-1 rounded border-2 border-(--bor2) bg-(--bg) px-1.5 text-[11px] font-mono text-(--t1) outline-none focus:border-(--cy)"
      />
    </div>
  );
}

export function ThemeTab({ projectId, styleFile, hasElement }: ThemeTabProps) {
  const content = styleFile?.content ?? '';
  const { groups } = useCssProperties(content, THEME_PROPERTIES);
  const { updateProperty } = useCssPropertyUpdates(projectId, styleFile?.id ?? null, content);

  return (
    <div className="space-y-4">
      {hasElement && (
        <div className="rounded-lg border border-(--cy-b) bg-(--cy-d) px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-(--cy)">
            Element theme
          </p>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.id}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-(--t3)">
            {group.label}
          </p>
          <div className="space-y-2">
            {group.properties.map((prop) => {
              if (prop.type === 'color') {
                return (
                  <div key={prop.varName}>
                    <label className="mb-0.5 block text-[11px] font-medium text-(--t2)">
                      {prop.label}
                    </label>
                    <ColorInput
                      value={prop.currentValue}
                      onChange={(v) => updateProperty(prop.varName, v)}
                    />
                  </div>
                );
              }

              if (prop.type === 'font') {
                return (
                  <div key={prop.varName}>
                    <label className="mb-0.5 block text-[11px] font-medium text-(--t2)">
                      {prop.label}
                    </label>
                    <Select
                      value={prop.currentValue}
                      onValueChange={(v) => updateProperty(prop.varName, v)}
                    >
                      <SelectTrigger className="h-7 w-full text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font} value={font} className="text-[11px]">
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          const blob = new Blob([content], { type: 'text/css' });
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          URL.revokeObjectURL(url);
        }}
        className="w-full rounded-lg border border-(--bor2) px-3 py-1.5 text-[11px] font-medium text-(--t2) transition-colors hover:bg-(--bg) hover:text-(--t1)"
      >
        View full theme.css
      </button>
    </div>
  );
}
