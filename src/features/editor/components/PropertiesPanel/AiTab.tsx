import { AiPanelRoot } from '@/features/editor/components/AI/AiPanelRoot';
import type { ProjectFile } from '@/types/api';

type AiTabProps = {
  selectedSlideHtmlFile: ProjectFile | null;
  styleCssFile: ProjectFile | null;
  layoutCssFile: ProjectFile | null;
  onInsertIntoEditor: (text: string) => void;
};

export function AiTab({ onInsertIntoEditor }: AiTabProps) {
  // parent already wraps us in <TabsContent value="ai"> via PropertiesPanel
  // we render just the AI panel content
  return (
    <div className="flex h-full flex-col">
      <p className="text-[11px] text-(--t3) mb-2">
        AI calls run in your browser. Your key stays in your session unless you opt into
        localStorage.
      </p>
      <AiPanelRoot onInsertIntoEditor={onInsertIntoEditor} />
    </div>
  );
}
