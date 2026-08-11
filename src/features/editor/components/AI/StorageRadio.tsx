import { useId } from 'react';

import { FieldLegend, FieldSet } from '@/components/ui/field';

type Mode = 'session' | 'local';

type StorageRadioProps = {
  value: Mode;
  onChange: (mode: Mode) => void;
  compact?: boolean;
};

export function StorageRadio({ value, onChange, compact = false }: StorageRadioProps) {
  const groupId = useId();
  return (
    <FieldSet
      className={
        compact ? 'flex flex-col gap-1 border-0 p-0 m-0' : 'flex flex-col gap-2 border-0 p-0 m-0'
      }
    >
      <FieldLegend
        className={
          compact
            ? 'sr-only mb-0'
            : 'text-xs font-semibold uppercase tracking-wider text-(--t2) mb-0'
        }
      >
        API key storage
      </FieldLegend>
      <label
        htmlFor={`${groupId}-session`}
        className="flex cursor-pointer items-start gap-2 rounded-md border border-(--bor2) p-2 text-xs hover:border-(--bor1)"
      >
        <input
          id={`${groupId}-session`}
          type="radio"
          name={`${groupId}-storage`}
          checked={value === 'session'}
          onChange={() => onChange('session')}
          className="mt-0.5"
        />
        <div>
          <div className="font-semibold text-(--t1)">sessionStorage (recommended)</div>
          <div className="text-(--t3)">Cleared when you close the tab. Nothing stored after.</div>
        </div>
      </label>
      <label
        htmlFor={`${groupId}-local`}
        className="flex cursor-pointer items-start gap-2 rounded-md border border-(--bor2) p-2 text-xs hover:border-(--bor1)"
      >
        <input
          id={`${groupId}-local`}
          type="radio"
          name={`${groupId}-storage`}
          checked={value === 'local'}
          onChange={() => onChange('local')}
          className="mt-0.5"
        />
        <div>
          <div className="font-semibold text-(--t1)">localStorage</div>
          <div className="text-(--t3)">
            Persists across browser sessions. Stored in plain text — only use on a device you trust.
          </div>
        </div>
      </label>
    </FieldSet>
  );
}
