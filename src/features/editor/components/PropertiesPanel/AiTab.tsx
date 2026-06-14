import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { Id } from '@/types/api';

type AiTabProps = {
  projectId: Id;
};

const MODEL_OPTIONS = [
  'claude-3-5-sonnet',
  'gpt-4o',
  'gpt-4o-mini',
];

export function AiTab({ projectId: _projectId }: AiTabProps) {
  const [prompt, setPrompt] = useState('');

  const hasHistory = false;

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-[11px] font-medium text-(--t2)">Prompt</label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the changes you want..."
          className="min-h-[80px] resize-y text-[11px]"
        />
      </div>

      <div>
        <label className="mb-0.5 block text-[11px] font-medium text-(--t2)">Model</label>
        <Select>
          <SelectTrigger className="h-7 w-full text-[11px]">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {MODEL_OPTIONS.map((model) => (
              <SelectItem key={model} value={model} className="text-[11px]">
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        disabled
        className="w-full h-7 text-[11px]"
      >
        Generate
      </Button>

      <div>
        <label className="mb-1 block text-[11px] font-medium text-(--t2)">JSON Output</label>
        <div className="rounded-lg border-2 border-(--bor2) bg-(--bg) p-2">
          <pre className="max-h-[120px] overflow-auto text-[10px] font-mono text-(--t3)">
            {'{ }'}
          </pre>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-(--t3)">
          History
        </p>
        {hasHistory ? (
          <p className="text-[11px] text-(--t3)">Previous generations appear here.</p>
        ) : (
          <p className="rounded-lg border-2 border-dashed border-(--bor2) px-3 py-4 text-center text-[11px] text-(--t3)">
            No generation history yet
          </p>
        )}
      </div>
    </div>
  );
}
