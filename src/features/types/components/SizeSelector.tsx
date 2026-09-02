import type { ProjectTypeSize } from '@/features/types/types/outputType';
import { isMultiSize } from '@/features/types/types/outputTypeMap';
import { SIZE_LABELS } from '@/features/types/types/sizeLabels';
import { cn } from '@/lib/utils';

type SizeSelectorProps = {
  sizes: ProjectTypeSize[];
  value?: ProjectTypeSize;
  onChange: (size: ProjectTypeSize) => void;
  label?: string;
};

export function SizeSelector({ sizes, value, onChange, label = 'Size' }: SizeSelectorProps) {
  if (!isMultiSize(sizes)) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-(--t2)">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {sizes.map((size) => {
          const active = value === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onChange(size)}
              className={cn(
                'h-7 rounded-md border px-2.5 text-xs font-medium transition-colors',
                active
                  ? 'border-(--cy) bg-(--cy) text-[#071112]'
                  : 'border-(--bor2) bg-(--sur) text-(--t2) hover:border-(--cy)/60',
              )}
            >
              {SIZE_LABELS[size]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
