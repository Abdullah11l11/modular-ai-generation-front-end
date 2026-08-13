import { AiPanelRoot } from '@/features/editor/components/AI/AiPanelRoot';
import type { ProjectFile } from '@/types/api';

type AiTabProps = {
  projectId: string;
  selectedSlideHtmlFile: ProjectFile | null;
  styleCssFile: ProjectFile | null;
  layoutCssFile: ProjectFile | null;
  onPreview: (html: string, messageId: number, label: string) => void;
  onInsert: (html: string) => void;
};

export function AiTab({ projectId, onPreview, onInsert }: AiTabProps) {
  // parent already wraps us in <TabsContent value="ai"> via PropertiesPanel
  // we render just the AI panel content
  return (
    <div className="flex h-full flex-col">
      <p className="text-[11px] text-(--t3) mb-2">
        AI calls run in your browser. Your key stays in your session unless you opt into
        localStorage.
      </p>
      <AiPanelRoot projectId={projectId} onPreview={onPreview} onInsert={onInsert} />
    </div>
  );
}
