import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
];

export function AiTab() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(MODELS[0].value);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-(--t3)">Model</label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((m) => (
              <SelectItem key={m.value} value={m.value} className="text-xs">{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-(--t3)">Prompt</label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the changes you want..."
          className="min-h-24 resize-none text-xs"
        />
      </div>

      <Button variant="accent" size="sm" disabled className="gap-1.5">
        Generate
      </Button>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-(--t3)">JSON Output</label>
        <pre className="min-h-16 rounded-md border border-(--bor2) bg-(--bg) p-2 text-xs text-(--t3) font-mono">
          No generation yet
        </pre>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-(--t2) uppercase tracking-wider">History</span>
        <p className="text-xs text-(--t3)">No previous generations</p>
      </div>
    </div>
  );
}
