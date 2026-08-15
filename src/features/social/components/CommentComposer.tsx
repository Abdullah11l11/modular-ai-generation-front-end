import { useState } from 'react';
import { Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentComposerProps {
  placeholder?: string;
  submitLabel?: string;
  isPending?: boolean;
  onSubmit: (body: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function CommentComposer({
  placeholder = 'Write a comment...',
  submitLabel = 'Comment',
  isPending = false,
  onSubmit,
  onCancel,
  autoFocus = false,
}: CommentComposerProps) {
  const [body, setBody] = useState('');

  const trimmedBody = body.trim();

  const handleSubmit = () => {
    if (!trimmedBody || isPending) {
      return;
    }

    onSubmit(trimmedBody);
    setBody('');
  };

  return (
    <div className="space-y-3">
      <Textarea
        autoFocus={autoFocus}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        className="min-h-24 resize-y"
        disabled={isPending}
        onKeyDown={(event) => {
          if (
            (event.ctrlKey || event.metaKey) &&
            event.key === 'Enter'
          ) {
            event.preventDefault();
            handleSubmit();
          }
        }}
      />

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}

        <Button
          type="button"
          size="sm"
          onClick={handleSubmit}
          disabled={!trimmedBody || isPending}
        >
          <Send className="mr-2 size-3.5" />
          {isPending ? 'Posting...' : submitLabel}
        </Button>
      </div>
    </div>
  );
}