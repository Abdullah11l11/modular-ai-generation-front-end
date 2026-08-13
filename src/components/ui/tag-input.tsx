import * as React from 'react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { XIcon } from 'lucide-react';

interface TagInputProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'type'> {
  value?: string[];
  onChange?: (tags: string[]) => void;
  maxTags?: number;
}

function TagInput({
  value = [],
  onChange,
  maxTags,
  className,
  placeholder = 'Add tag...',
  disabled,
  ...props
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('');

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (maxTags !== undefined && value.length >= maxTags) return;
    if (value.includes(tag)) return;
    onChange?.([...value, tag]);
  };

  const removeTag = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange?.(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
      setInputValue('');
    }
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(',')) {
      const parts = val.split(',');
      parts.forEach((p) => addTag(p));
      setInputValue('');
    } else {
      setInputValue(val);
    }
  };

  const handleBlur = () => {
    if (inputValue) {
      addTag(inputValue);
      setInputValue('');
    }
  };

  return (
    <div
      data-slot="tag-input"
      className={cn(
        'flex min-h-8 flex-wrap items-center gap-1.5 rounded-(--r8,8px) border-2 border-(--bor) bg-(--sur) px-2.5 py-1 transition-colors duration-150 has-focus:border-(--cy)',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className,
      )}
    >
      {value.map((tag, i) => (
        <span
          key={tag}
          data-slot="tag"
          className="inline-flex items-center gap-1 rounded-(--r4,4px) bg-(--sur2) px-1.5 py-0.5 font-(--font-code) text-[11px] leading-none text-(--t1) ring-1 ring-(--bor2)/50"
        >
          {tag}
          <button
            type="button"
            tabIndex={-1}
            onClick={() => removeTag(i)}
            className="inline-flex size-3.5 items-center justify-center rounded-sm text-(--t3) hover:bg-(--bor2)/30 hover:text-(--t1)"
          >
            <XIcon className="size-2.5" />
          </button>
        </span>
      ))}
      <Input
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? placeholder : ''}
        disabled={disabled || (maxTags !== undefined && value.length >= maxTags)}
        className="h-6 min-w-20 flex-1 border-none bg-transparent px-0 py-0 text-[13px] text-(--t1) placeholder:text-(--t3) focus:border-none focus:ring-0"
        {...props}
      />
    </div>
  );
}

export { TagInput };
export type { TagInputProps };
