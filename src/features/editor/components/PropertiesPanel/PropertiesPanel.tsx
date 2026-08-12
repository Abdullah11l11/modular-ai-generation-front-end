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

  const isPerSlide = state.editorMode === 'per-slide';

  const styleContent = styleCssFile?.content ?? '';
  const slideContent = selectedSlideHtmlFile?.content ?? '';
  const layoutContent = layoutCssFile?.content ?? '';
  // Style tab mutates real `--mgf-*` typography / spacing / shape
  // tokens (see `STYLE_PROPERTIES` in cssProperties.ts). The Theme tab
  // already covers colors + fonts. Style tab handles sizes, weights,
  // line-height, letter-spacing, spacing scale, slide padding, and
  // radius — everything else. UVCP per-slide projects have no
  // layout.css, so fall back to the project-level style.css.
  const styleTabFile = isPerSlide ? styleCssFile : layoutCssFile;
  const styleTabContent = styleTabFile?.content ?? styleContent;

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
      onValueChange={(val) =>
        dispatch({ type: 'SET_ACTIVE_TAB', payload: val as typeof state.activeTab })
      }
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
        {/* `forceMount` keeps every tab's content mounted. Without it Radix
            unmounts inactive tabs, which destroys local state — e.g. the
            AI chat messages disappear as soon as the user switches away
            and back. */}
        <TabsContent value="theme" forceMount className={state.activeTab === 'theme' ? '' : 'hidden'}>
          {isPerSlide ? (
            <ThemeTab
              fileContent={styleContent}
              fileId={styleCssFile?.id ?? ''}
              onUpdate={(_, c) => {
                if (styleCssFile) scheduleUpdate(styleCssFile.id, c);
              }}
            />
          ) : (
            <ThemeTab
              fileContent={layoutContent}
              fileId={layoutCssFile?.id ?? ''}
              onUpdate={(_, c) => {
                if (layoutCssFile) scheduleUpdate(layoutCssFile.id, c);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="content" forceMount className={state.activeTab === 'content' ? '' : 'hidden'}>
          <ContentTab
            fileContent={slideContent}
            fileId={selectedSlideHtmlFile?.id ?? ''}
            onUpdate={(_, c) => {
              if (selectedSlideHtmlFile) scheduleUpdate(selectedSlideHtmlFile.id, c);
            }}
          />
        </TabsContent>

        <TabsContent value="style" forceMount className={state.activeTab === 'style' ? '' : 'hidden'}>
          <StyleTab
            fileContent={styleTabContent}
            fileId={styleTabFile?.id ?? ''}
            onUpdate={(_, c) => {
              if (styleTabFile) scheduleUpdate(styleTabFile.id, c);
            }}
          />
        </TabsContent>

        <TabsContent value="ai" forceMount className={state.activeTab === 'ai' ? '' : 'hidden'}>
          <AiTab
            selectedSlideHtmlFile={selectedSlideHtmlFile}
            styleCssFile={styleCssFile}
            layoutCssFile={layoutCssFile}
            onInsertIntoEditor={(text) => {
              const match = text.match(/<(\w+)[^>]*\bmgf-slide\b[^>]*>[\s\S]*?<\/\1>/);
              if (match && selectedSlideHtmlFile) {
                scheduleUpdate(selectedSlideHtmlFile.id, match[0]);
              }
            }}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
