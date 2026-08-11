import { useId } from 'react';

type Mode = 'session' | 'local';

type StorageRadioProps = {
  value: Mode;
  onChange: (mode: Mode) => void;
  compact?: boolean;
};

export function StorageRadio({ value, onChange, compact = false }: StorageRadioProps) {
  const groupId = useId();
  return (
    <div className={compact ? 'flex flex-col gap-1' : 'flex flex-col gap-2'}>
      {!compact && (
        <span className="text-xs font-semibold uppercase tracking-wider text-(--t2)">
          API key storage
        </span>
      )}
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
    </div>
  );
}
