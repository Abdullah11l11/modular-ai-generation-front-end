import { useCssProperties } from '@/features/editor/hooks/useCssProperties';
import { useCssPropertyUpdates } from '@/features/editor/hooks/useCssPropertyUpdates';
import { STYLE_PROPERTIES } from '@/features/editor/types/cssProperties';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { ProjectFile, Id } from '@/types/api';

type StyleTabProps = {
  projectId: Id;
  layoutFile: ProjectFile | null;
};

export function StyleTab({ projectId, layoutFile }: StyleTabProps) {
  const content = layoutFile?.content ?? '';
  const { groups } = useCssProperties(content, STYLE_PROPERTIES);
  const { updateProperty } = useCssPropertyUpdates(projectId, layoutFile?.id ?? null, content);

  const ALIGN_BUTTONS = [
    { value: 'left', label: 'L' },
    { value: 'center', label: 'C' },
    { value: 'right', label: 'R' },
    { value: 'justify', label: 'J' },
  ];

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.id}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-(--t3)">
            {group.label}
          </p>
          <div className="space-y-2">
            {group.properties.map((prop) => {
              if (prop.type === 'size' || prop.type === 'spacing') {
                return (
                  <div key={prop.varName}>
                    <label className="mb-0.5 block text-[11px] font-medium text-(--t2)">
                      {prop.label}
                    </label>
                    <Input
                      value={prop.currentValue}
                      onChange={(e) => updateProperty(prop.varName, e.target.value)}
                      className="h-7 text-[11px]"
                    />
                  </div>
                );
              }

              if (prop.type === 'select' && prop.varName === '--text-align') {
                const current = prop.currentValue || 'left';
                return (
                  <div key={prop.varName}>
                    <label className="mb-1 block text-[11px] font-medium text-(--t2)">
                      {prop.label}
                    </label>
                    <div className="flex gap-1">
                      {ALIGN_BUTTONS.map((btn) => (
                        <button
                          key={btn.value}
                          type="button"
                          onClick={() => updateProperty(prop.varName, btn.value)}
                          className={`flex h-7 w-7 items-center justify-center rounded border-2 text-[11px] font-bold transition-colors ${
                            current === btn.value
                              ? 'border-(--cy) bg-(--cy) text-white'
                              : 'border-(--bor2) bg-(--bg) text-(--t2) hover:border-(--cy-b)'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              if (prop.type === 'select') {
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
                        {prop.options?.map((opt) => (
                          <SelectItem key={opt} value={opt} className="text-[11px]">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              if (prop.type === 'slider') {
                const num = parseFloat(prop.currentValue) || 0;
                return (
                  <div key={prop.varName}>
                    <div className="mb-0.5 flex items-center justify-between">
                      <label className="text-[11px] font-medium text-(--t2)">
                        {prop.label}
                      </label>
                      <span className="text-[10px] font-mono text-(--t3)">
                        {num.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={prop.min ?? 0}
                      max={prop.max ?? 1}
                      step={prop.step ?? 0.01}
                      value={num}
                      onChange={(e) => updateProperty(prop.varName, e.target.value)}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-(--bor2) accent-(--cy)"
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>

          {group.id === 'padding' && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <div>
                <span className="block text-[10px] font-medium text-(--t3)">Top</span>
                <Input
                  value={group.properties.find((p) => p.varName === '--padding-top')?.currentValue ?? '0'}
                  onChange={(e) => updateProperty('--padding-top', e.target.value)}
                  className="h-7 text-[11px]"
                />
              </div>
              <div>
                <span className="block text-[10px] font-medium text-(--t3)">Right</span>
                <Input
                  value={group.properties.find((p) => p.varName === '--padding-right')?.currentValue ?? '0'}
                  onChange={(e) => updateProperty('--padding-right', e.target.value)}
                  className="h-7 text-[11px]"
                />
              </div>
              <div>
                <span className="block text-[10px] font-medium text-(--t3)">Bottom</span>
                <Input
                  value={group.properties.find((p) => p.varName === '--padding-bottom')?.currentValue ?? '0'}
                  onChange={(e) => updateProperty('--padding-bottom', e.target.value)}
                  className="h-7 text-[11px]"
                />
              </div>
              <div>
                <span className="block text-[10px] font-medium text-(--t3)">Left</span>
                <Input
                  value={group.properties.find((p) => p.varName === '--padding-left')?.currentValue ?? '0'}
                  onChange={(e) => updateProperty('--padding-left', e.target.value)}
                  className="h-7 text-[11px]"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
