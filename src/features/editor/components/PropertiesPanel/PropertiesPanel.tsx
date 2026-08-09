import { useEditorContext } from '@/features/editor/hooks/useEditorStore';
import { useCssPropertyUpdates } from '@/features/editor/hooks/useCssPropertyUpdates';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ThemeTab } from '@/features/editor/components/PropertiesPanel/ThemeTab';
import { ContentTab } from '@/features/editor/components/PropertiesPanel/ContentTab';
import { StyleTab } from '@/features/editor/components/PropertiesPanel/StyleTab';
import { AiTab } from '@/features/editor/components/PropertiesPanel/AiTab';
import type { ProjectFile } from '@/types/api';

type PropertiesPanelProps = {
  projectId: string;
  selectedSlideHtmlFile: ProjectFile | null;
  styleCssFile: ProjectFile | null;
  layoutCssFile: ProjectFile | null;
  filesLoading: boolean;
};

export function PropertiesPanel({
  projectId,
  selectedSlideHtmlFile,
  styleCssFile,
  layoutCssFile,
  filesLoading,
}: PropertiesPanelProps) {
  const { state, dispatch } = useEditorContext();
  const { scheduleUpdate } = useCssPropertyUpdates(projectId);

  const styleContent = styleCssFile?.content ?? '';
  const slideContent = selectedSlideHtmlFile?.content ?? '';
  const layoutContent = layoutCssFile?.content ?? '';

  const isPerSlide = state.editorMode === 'per-slide';

  if (filesLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-7 w-full animate-pulse rounded-md bg-(--bor2)" />
        <div className="h-7 w-3/4 animate-pulse rounded-md bg-(--bor2)" />
        <div className="h-7 w-1/2 animate-pulse rounded-md bg-(--bor2)" />
      </div>
    );
  }

  const tabs = isPerSlide
    ? [
        { value: 'theme' as const, label: 'Theme' },
        { value: 'content' as const, label: 'Content' },
        { value: 'style' as const, label: 'Style' },
        { value: 'ai' as const, label: 'AI' },
      ]
    : [
        { value: 'theme' as const, label: 'Layout' },
        { value: 'content' as const, label: 'Content' },
        { value: 'style' as const, label: 'Style' },
        { value: 'ai' as const, label: 'AI' },
      ];

  return (
    <Tabs
      value={state.activeTab}
      onValueChange={(val) => dispatch({ type: 'SET_ACTIVE_TAB', payload: val as typeof state.activeTab })}
      className="flex h-full flex-col"
    >
      <TabsList className="w-full">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex-1 text-xs">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="flex-1 overflow-y-auto pt-3">
        <TabsContent value="theme">
          {isPerSlide ? (
            <ThemeTab fileContent={styleContent} fileId={styleCssFile?.id ?? ''} onUpdate={(_, c) => {
              if (styleCssFile) scheduleUpdate(styleCssFile.id, c);
            }} />
          ) : (
            <ThemeTab fileContent={layoutContent} fileId={layoutCssFile?.id ?? ''} onUpdate={(_, c) => {
              if (layoutCssFile) scheduleUpdate(layoutCssFile.id, c);
            }} />
          )}
        </TabsContent>

        <TabsContent value="content">
          {state.selectedElement ? (
            <ContentTab fileContent={slideContent} fileId={selectedSlideHtmlFile?.id ?? ''} onUpdate={(_, c) => {
              if (selectedSlideHtmlFile) scheduleUpdate(selectedSlideHtmlFile.id, c);
            }} />
          ) : (
            <p className="text-xs text-(--t3) px-1">Select an element to edit</p>
          )}
        </TabsContent>

        <TabsContent value="style">
          <StyleTab fileContent={layoutContent} fileId={layoutCssFile?.id ?? ''} onUpdate={(_, c) => {
            if (layoutCssFile) scheduleUpdate(layoutCssFile.id, c);
          }} />
        </TabsContent>

        <TabsContent value="ai">
          <AiTab />
        </TabsContent>
      </div>
    </Tabs>
  );
}
