import { Button } from '@/components/ui/button';
import { SparklesIcon } from 'lucide-react';
import { GenerationHistory } from '@/features/editor/components/Generation/GenerationHistory';
import type { Id } from '@/types/api';

type AiTabProps = {
  projectId: Id;
  onOpenGeneration: () => void;
};

export function AiTab({ projectId, onOpenGeneration }: AiTabProps) {
  return (
    <div className="flex flex-col gap-3 p-3">
      <Button variant="accent" size="sm" className="w-full" onClick={onOpenGeneration}>
        <SparklesIcon className="size-3.5" />
        Open Generation Dialog
      </Button>

      <div className="mt-1 flex flex-col gap-2">
        <span className="text-[10px] font-semibold text-(--t3) uppercase">History</span>
        <GenerationHistory projectId={projectId} />
      </div>
    </div>
  );
}
