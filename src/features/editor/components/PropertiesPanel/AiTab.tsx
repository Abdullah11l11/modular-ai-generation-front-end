import { Button } from '@/components/ui/button';
import { GenerationHistory } from '@/features/editor/components/Generation/GenerationHistory';
import { SparklesIcon } from 'lucide-react';
import type { Id } from '@/types/api';

type AiTabProps = {
  projectId: Id;
  onOpenGenerationModal?: () => void;
};

export function AiTab({ projectId, onOpenGenerationModal }: AiTabProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-dashed border-(--cy-b) bg-(--cy-d) px-4 py-4 text-center">
        <SparklesIcon className="mx-auto mb-2 size-5 text-(--cy)" />
        <p className="mb-2 text-[13px] font-medium text-(--t1)">
          Generate with AI
        </p>
        <p className="mb-3 text-[11px] text-(--t3)">
          Use AI to generate or enhance your project content
        </p>
        <Button
          variant="accent"
          size="sm"
          onClick={onOpenGenerationModal}
          className="w-full"
        >
          <SparklesIcon className="mr-1 size-3.5" />
          Open Generation Dialog
        </Button>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-(--t3)">
          History
        </p>
        <GenerationHistory projectId={projectId} />
      </div>
    </div>
  );
}
