import { useCssProperties } from '@/features/editor/hooks/useCssProperties';
import { CONTENT_PROPERTIES } from '@/features/editor/types/cssProperties';

type ContentTabProps = {
  fileContent: string;
  fileId: string;
  onUpdate: (fileId: string, content: string) => void;
};

export function ContentTab({ fileContent, fileId, onUpdate }: ContentTabProps) {
  const { groups } = useCssProperties(fileContent, CONTENT_PROPERTIES);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-(--t2) uppercase tracking-wider">{group.label}</span>
          {group.properties.map((prop) => (
            <div key={prop.key} className="flex flex-col gap-1">
              <label className="text-xs text-(--t3)">{prop.label}</label>
              {prop.type === 'text' ? (
                <input
                  type="text"
                  value={prop.value}
                  onChange={(e) => {
                    const regex = new RegExp(`(--${prop.key}\\s*:\\s*)[^;]+`);
                    const newContent = regex.test(fileContent)
                      ? fileContent.replace(regex, `$1${e.target.value}`)
                      : fileContent.replace(/(:root\s*\{)/, `$1\n  --${prop.key}: ${e.target.value};`);
                    onUpdate(fileId, newContent);
                  }}
                  className="h-7 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
                />
              ) : prop.type === 'size' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={prop.value}
                    onChange={(e) => {
                      const regex = new RegExp(`(--${prop.key}\\s*:\\s*)[^;]+`);
                      const newContent = regex.test(fileContent)
                        ? fileContent.replace(regex, `$1${e.target.value}`)
                        : fileContent.replace(/(:root\s*\{)/, `$1\n  --${prop.key}: ${e.target.value};`);
                      onUpdate(fileId, newContent);
                    }}
                    className="h-7 flex-1 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
                  />
                  <span className="text-xs text-(--t3)">px/rem</span>
                </div>
              ) : prop.type === 'weight' ? (
                <select
                  value={prop.value}
                  onChange={(e) => {
                    const regex = new RegExp(`(--${prop.key}\\s*:\\s*)[^;]+`);
                    const newContent = regex.test(fileContent)
                      ? fileContent.replace(regex, `$1${e.target.value}`)
                      : fileContent.replace(/(:root\s*\{)/, `$1\n  --${prop.key}: ${e.target.value};`);
                    onUpdate(fileId, newContent);
                  }}
                  className="h-7 rounded-md border border-(--bor2) bg-(--sur) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
                >
                  {['100', '200', '300', '400', '500', '600', '700', '800', '900'].map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              ) : prop.type === 'color' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={prop.value}
                    onChange={(e) => {
                      const regex = new RegExp(`(--${prop.key}\\s*:\\s*)[^;]+`);
                      const newContent = regex.test(fileContent)
                        ? fileContent.replace(regex, `$1${e.target.value}`)
                        : fileContent.replace(/(:root\s*\{)/, `$1\n  --${prop.key}: ${e.target.value};`);
                      onUpdate(fileId, newContent);
                    }}
                    className="size-6 cursor-pointer rounded border border-(--bor2)"
                  />
                  <span className="text-xs text-(--t3) font-mono">{prop.value}</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
