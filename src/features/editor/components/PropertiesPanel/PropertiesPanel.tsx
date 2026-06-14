import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useEditorStore } from '@/features/editor/hooks/useEditorStore';
import type { ActiveTab } from '@/features/editor/hooks/useEditorStore';
import { ThemeTab } from '@/features/editor/components/PropertiesPanel/ThemeTab';
import { ContentTab } from '@/features/editor/components/PropertiesPanel/ContentTab';
import { StyleTab } from '@/features/editor/components/PropertiesPanel/StyleTab';
import { AiTab } from '@/features/editor/components/PropertiesPanel/AiTab';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProjectFile, Id } from '@/types/api';

type PropertiesPanelProps = {
  projectId: Id;
  selectedSlide: ProjectFile | null;
  styleFile: ProjectFile | null;
  layoutFile: ProjectFile | null;
  filesLoading: boolean;
  onOpenGenerationModal?: () => void;
};

export function PropertiesPanel({
  projectId,
  selectedSlide,
  styleFile,
  layoutFile,
  filesLoading,
  onOpenGenerationModal,
}: PropertiesPanelProps) {
  const { state, dispatch } = useEditorStore();
  const hasElement = !!state.selectedElement;

  if (filesLoading) {
    return (
      <aside className="w-67.5 shrink-0 border-l border-(--bor2) bg-(--sur) p-3 overflow-y-auto">
        <Skeleton className="mb-3 h-5 w-20" />
        <Skeleton className="mb-2 h-7 w-full" />
        <Skeleton className="h-40 w-full" />
      </aside>
    );
  }

  return (
    <aside className="w-67.5 shrink-0 border-l border-(--bor2) bg-(--sur) overflow-y-auto">
      <Tabs
        value={state.activeTab}
        onValueChange={(v) => dispatch({ type: 'SET_ACTIVE_TAB', payload: v as ActiveTab })}
        className="flex h-full flex-col"
      >
        <div className="sticky top-0 z-10 bg-(--sur) px-2 pt-2 pb-0">
          <TabsList className="w-full">
            <TabsTrigger value="theme" className="text-[11px] flex-1">Theme</TabsTrigger>
            <TabsTrigger value="content" className="text-[11px] flex-1">Content</TabsTrigger>
            <TabsTrigger value="style" className="text-[11px] flex-1">Style</TabsTrigger>
            <TabsTrigger value="ai" className="text-[11px] flex-1">AI</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <TabsContent value="theme" className="mt-0">
            <ThemeTab
              projectId={projectId}
              styleFile={styleFile}
              hasElement={hasElement}
            />
          </TabsContent>

          <TabsContent value="content" className="mt-0">
            {hasElement ? (
              <ContentTab
                projectId={projectId}
                selectedSlide={selectedSlide}
              />
            ) : (
              <p className="text-xs text-(--t3) py-8 text-center">
                Select an element to edit
              </p>
            )}
          </TabsContent>

          <TabsContent value="style" className="mt-0">
            {hasElement ? (
              <StyleTab
                projectId={projectId}
                layoutFile={layoutFile}
              />
            ) : (
              <p className="text-xs text-(--t3) py-8 text-center">
                Select an element to edit
              </p>
            )}
          </TabsContent>

          <TabsContent value="ai" className="mt-0">
            <AiTab projectId={projectId} onOpenGenerationModal={onOpenGenerationModal} />
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
