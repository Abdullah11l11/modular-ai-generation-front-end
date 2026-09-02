import type { OutputType } from '@/types/api';
import { getOutputTypeInfo } from '@/features/types/types/outputTypeMap';
import { SIZE_LABELS } from '@/features/types/types/sizeLabels';
import { cn } from '@/lib/utils';

type TypePickerProps = {
  types: OutputType[] | undefined;
  value?: string;
  onValueChange: (typeId: string) => void;
  loading?: boolean;
};

export function TypePicker({ types, value, onValueChange, loading }: TypePickerProps) {
  if (loading) {
    return <div className="grid grid-cols-2 gap-2 opacity-60">Loading types…</div>;
  }

  if (!types || types.length === 0) {
    return <p className="text-xs text-(--t3)">No types available.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {types.map((t) => {
        const info = getOutputTypeInfo(t.name);
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onValueChange(t.id)}
            aria-pressed={active}
            className={cn(
              'flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-colors',
              active
                ? 'border-(--cy) bg-(--cy)/10 ring-1 ring-(--cy)'
                : 'border-(--bor2) bg-(--sur) hover:border-(--cy)/60',
            )}
          >
            <span className="flex items-center gap-1.5 text-sm font-semibold text-(--t1)">
              {t.icon && (
                <span className="text-xs uppercase tracking-wide text-(--cy)">{t.icon}</span>
              )}
              {t.name}
            </span>
            <span className="text-[11px] leading-snug text-(--t3)">
              {t.description || info.name}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-(--cy)">
              {info.archetype} · {SIZE_LABELS[info.defaultSize]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
