import { useCssProperties } from '@/features/editor/hooks/useCssProperties';
import { STYLE_PROPERTIES } from '@/features/editor/types/cssProperties';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type StyleTabProps = {
  fileContent: string;
  fileId: string;
  onUpdate: (fileId: string, content: string) => void;
};

export function StyleTab({ fileContent, fileId, onUpdate }: StyleTabProps) {
  const { groups } = useCssProperties(fileContent, STYLE_PROPERTIES);

  function updateValue(key: string, value: string) {
    const regex = new RegExp(`(--${key}\\s*:\\s*)[^;]+`);
    const newContent = regex.test(fileContent)
      ? fileContent.replace(regex, `$1${value}`)
      : fileContent.replace(/(:root\s*\{)/, `$1\n  --${key}: ${value};`);
    onUpdate(fileId, newContent);
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-(--t2) uppercase tracking-wider">{group.label}</span>
          {group.properties.map((prop) => (
            <div key={prop.key} className="flex flex-col gap-1">
              <label className="text-xs text-(--t3)">{prop.label}</label>
              {prop.type === 'size' ? (
                <input
                  type="text"
                  value={prop.value}
                  onChange={(e) => updateValue(prop.key, e.target.value)}
                  className="h-7 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
                />
              ) : prop.type === 'line-height' ? (
                <input
                  type="text"
                  value={prop.value}
                  onChange={(e) => updateValue(prop.key, e.target.value)}
                  className="h-7 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
                />
              ) : prop.type === 'letter-spacing' ? (
                <input
                  type="text"
                  value={prop.value}
                  onChange={(e) => updateValue(prop.key, e.target.value)}
                  className="h-7 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
                />
              ) : prop.type === 'weight' ? (
                <select
                  value={prop.value}
                  onChange={(e) => updateValue(prop.key, e.target.value)}
                  className="h-7 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
                >
                  {['100', '200', '300', '400', '500', '600', '700', '800', '900'].map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              ) : prop.type === 'align' ? (
                <Select value={prop.value} onValueChange={(val) => updateValue(prop.key, val)}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(prop.options ?? []).map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : prop.type === 'opacity' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={prop.value}
                    onChange={(e) => updateValue(prop.key, e.target.value)}
                    className="flex-1"
                  />
                  <span className="w-8 text-xs text-(--t3) text-right">{prop.value}</span>
                </div>
              ) : prop.type === 'spacing' ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={prop.value}
                    onChange={(e) => updateValue(prop.key, e.target.value)}
                    className="h-7 flex-1 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
                  />
                  <span className="text-xs text-(--t3)">px</span>
                </div>
              ) : prop.type === 'border-radius' ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={prop.value}
                    onChange={(e) => updateValue(prop.key, e.target.value)}
                    className="h-7 flex-1 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
                  />
                  <span className="text-xs text-(--t3)">px</span>
                </div>
              ) : prop.type === 'z-index' ? (
                <input
                  type="number"
                  value={prop.value}
                  onChange={(e) => updateValue(prop.key, e.target.value)}
                  className="h-7 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
                />
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
