import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AiTab } from '@/features/editor/components/PropertiesPanel/AiTab';
import { LayoutTab } from '@/features/editor/components/SinglePageEditor/tabs/LayoutTab';
import { HtmlTab } from '@/features/editor/components/SinglePageEditor/tabs/HtmlTab';
import { CssTab } from '@/features/editor/components/SinglePageEditor/tabs/CssTab';
import { ContentTab } from '@/features/editor/components/SinglePageEditor/tabs/ContentTab';
import type { ProjectFile } from '@/types/api';

type SinglePagePropertiesPanelProps = {
  projectId: string;
  htmlFile: ProjectFile | null;
  styleFile: ProjectFile | null;
  contentFile: ProjectFile | null;
  layoutFile: ProjectFile | null;
  filesLoading: boolean;
};

const TABS = [
  { value: 'layout', label: 'Layout' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'content', label: 'Content' },
  { value: 'ai', label: 'AI' },
] as const;

export function SinglePagePropertiesPanel({
  projectId,
  htmlFile,
  styleFile,
  contentFile,
  layoutFile,
  filesLoading,
}: SinglePagePropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState('layout');

  if (filesLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-7 w-full animate-pulse rounded-md bg-(--bor2)" />
        <div className="h-7 w-3/4 animate-pulse rounded-md bg-(--bor2)" />
        <div className="h-7 w-1/2 animate-pulse rounded-md bg-(--bor2)" />
      </div>
    );
  }

  const hasNoFiles = !htmlFile && !styleFile && !contentFile;

  if (hasNoFiles) {
    return <p className="text-xs text-(--t3)">No files yet</p>;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
      <TabsList className="w-full">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex-1 text-xs">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="flex-1 overflow-y-auto pt-3">
        <TabsContent value="layout">
          <LayoutTab projectId={projectId} layoutFile={layoutFile} />
        </TabsContent>
        <TabsContent value="html">
          <HtmlTab projectId={projectId} htmlFile={htmlFile} />
        </TabsContent>
        <TabsContent value="css">
          <CssTab projectId={projectId} styleFile={styleFile} />
        </TabsContent>
        <TabsContent value="content">
          <ContentTab projectId={projectId} contentFile={contentFile} />
        </TabsContent>
        <TabsContent value="ai">
          <AiTab />
        </TabsContent>
      </div>
    </Tabs>
  );
}
