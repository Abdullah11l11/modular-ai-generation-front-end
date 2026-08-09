import { useEffect } from 'react';
import { useInitSinglePageProject } from '@/features/editor/hooks/useInitSinglePageProject';
import { PreviewCanvas } from '@/features/editor/components/Preview/PreviewCanvas';
import { SinglePagePropertiesPanel } from '@/features/editor/components/SinglePageEditor/SinglePagePropertiesPanel';
import { FullPageLoader } from '@/components/full-page-loader';
import type { Project, ProjectFile } from '@/types/api';

type SinglePageEditorShellProps = {
  project: Project;
  files: ProjectFile[];
  filesLoading: boolean;
};

function findFile(files: ProjectFile[], layer: string, name: string): ProjectFile | undefined {
  return files.find((f) => f.layer === layer && f.name === name);
}

export function SinglePageEditorShell({ project, files, filesLoading }: SinglePageEditorShellProps) {
  const { init, isInitializing } = useInitSinglePageProject(project.id, files, !!project.template_id);

  useEffect(() => {
    init();
  }, []);

  const htmlFile = findFile(files, 'slide', 'content.html') ?? null;
  const styleFile = findFile(files, 'style', 'style.css') ?? null;
  const contentFile = findFile(files, 'content', 'content.json') ?? null;
  const layoutFile = findFile(files, 'layout', 'layout.css') ?? null;

  if (isInitializing) {
    return <FullPageLoader label="Setting up project..." />;
  }

  return (
    <>
      <main className="flex flex-1 overflow-hidden">
        <PreviewCanvas />
      </main>

      <aside className="flex w-72 shrink-0 flex-col border-l border-(--bor2) bg-(--sur) p-3">
        <SinglePagePropertiesPanel
          projectId={project.id}
          htmlFile={htmlFile}
          styleFile={styleFile}
          contentFile={contentFile}
          layoutFile={layoutFile}
          filesLoading={filesLoading}
        />
      </aside>
    </>
  );
}
