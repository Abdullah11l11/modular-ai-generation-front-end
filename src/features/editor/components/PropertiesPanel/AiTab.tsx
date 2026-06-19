import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SparklesIcon } from 'lucide-react';

export function AiTab() {
  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-(--t2)">Prompt</label>
        <Textarea
          placeholder="Describe what you want to generate..."
          className="min-h-[80px] resize-none text-xs"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-(--t2)">Model</label>
        <div className="flex gap-1.5">
          {['Fast', 'Balanced', 'Creative'].map((model) => (
            <Button
              key={model}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              {model}
            </Button>
          ))}
        </div>
      </div>

      <Button variant="accent" size="sm" disabled>
        <SparklesIcon className="size-3.5" />
        Generate
      </Button>

      <div className="mt-2 flex flex-col gap-2">
        <span className="text-[10px] font-semibold text-(--t3) uppercase">Output</span>
        <div className="rounded-md border border-(--bor2) bg-(--bg) p-2">
          <p className="text-xs text-(--t3)">Generation results will appear here.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold text-(--t3) uppercase">History</span>
        <p className="text-xs text-(--t3)">No generation history yet.</p>
      </div>
    </div>
  );
}
