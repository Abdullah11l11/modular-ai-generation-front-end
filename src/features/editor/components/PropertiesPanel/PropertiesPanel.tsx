import { useMemo } from 'react';
import { useEditorContext, type ActiveTab } from '@/features/editor/hooks/useEditorStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeTab } from './ThemeTab';
import { ContentTab } from './ContentTab';
import { StyleTab } from './StyleTab';
import { AiTab } from './AiTab';
import type { Id, ProjectFile } from '@/types/api';

type PropertiesPanelProps = {
  projectId: Id;
  files: ProjectFile[];
  filesLoading: boolean;
};

export function PropertiesPanel({ projectId, files, filesLoading }: PropertiesPanelProps) {
  const { state, dispatch } = useEditorContext();

  const styleFile = useMemo(
    () => files.find((f) => f.layer === 'style' && f.name === 'style' && f.extension === 'css') ?? null,
    [files],
  );

  const layoutFile = useMemo(
    () => files.find((f) => f.layer === 'layout' && f.name === 'layout' && f.extension === 'css') ?? null,
    [files],
  );

  const selectedSlide = useMemo(
    () => (state.selectedSlideId ? files.find((f) => f.id === state.selectedSlideId) ?? null : null),
    [state.selectedSlideId, files],
  );

  const slideContentFile = useMemo(
    () => (selectedSlide
      ? files.find(
          (f) => f.layer === 'content' && f.name === selectedSlide.name && f.extension === 'json',
        ) ?? null
      : null),
    [selectedSlide, files],
  );

  if (filesLoading) {
    return (
      <div className="flex flex-col gap-3 p-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-full rounded-md" />
        ))}
      </div>
    );
  }

  const tabs: { value: ActiveTab; label: string }[] = [
    { value: 'theme', label: 'Theme' },
    { value: 'content', label: 'Content' },
    { value: 'style', label: 'Style' },
    { value: 'ai', label: 'AI' },
  ];

  return (
    <Tabs
      value={state.activeTab}
      onValueChange={(v) => dispatch({ type: 'SET_ACTIVE_TAB', payload: v as ActiveTab })}
      className="flex flex-1 flex-col overflow-hidden"
    >
      <TabsList variant="line" className="w-full px-3 pt-1">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="flex-1 overflow-y-auto">
        <TabsContent value="theme">
          <ThemeTab projectId={projectId} styleFile={styleFile} />
        </TabsContent>

        <TabsContent value="content">
          {!state.selectedElement || !selectedSlide ? (
            <div className="flex items-center justify-center p-6 text-center text-xs text-(--t3)">
              Select an element to edit
            </div>
          ) : (
            <ContentTab
              projectId={projectId}
              slideHtmlFile={selectedSlide}
              slideContentFile={slideContentFile}
            />
          )}
        </TabsContent>

        <TabsContent value="style">
          {!state.selectedElement ? (
            <div className="flex items-center justify-center p-6 text-center text-xs text-(--t3)">
              Select an element to edit
            </div>
          ) : (
            <StyleTab projectId={projectId} layoutFile={layoutFile} />
          )}
        </TabsContent>

        <TabsContent value="ai">
          <AiTab />
        </TabsContent>
      </div>
    </Tabs>
  );
}
