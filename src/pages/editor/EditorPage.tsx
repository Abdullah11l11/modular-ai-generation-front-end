import { useParams } from 'react-router-dom';
import { useProject } from '@/features/projects/hooks/useProject';
import { useProjectFiles } from '@/features/files/hooks/useProjectFiles';
import { EditorProvider } from '@/features/editor/components/EditorProvider';
import { EditorToolbar } from '@/features/editor/components/EditorToolbar';
import { EditorStatusBar } from '@/features/editor/components/EditorStatusBar';
import { SlideLibraryPanel } from '@/features/editor/components/SlideLibrary/SlideLibraryPanel';
import { ErrorFallback } from '@/components/error-fallback';
import { FullPageLoader } from '@/components/full-page-loader';
import type { ProjectFileKind } from '@/types/api';

export default function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return <ErrorFallback error={new Error('Project ID is required')} />;
  }

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
    error: projectErr,
    refetch: refetchProject,
  } = useProject(projectId);

  const {
    data: filesResponse,
    isLoading: filesLoading,
    isError: filesError,
    error: filesErr,
    refetch: refetchFiles,
  } = useProjectFiles(projectId);

  if (projectError) {
    return <ErrorFallback error={projectErr as Error} reset={refetchProject} />;
  }

  if (filesError) {
    return <ErrorFallback error={filesErr as Error} reset={refetchFiles} />;
  }

  if (projectLoading || filesLoading || !project) {
    return <FullPageLoader label="Loading editor..." />;
  }

  const files = filesResponse?.data ?? [];
  const slideFiles = files.filter((f) => f.layer === 'slide');
  const activeLayers = [...new Set(files.map((f) => f.layer))] as ProjectFileKind[];

  return (
    <EditorProvider>
      <div className="flex flex-1 flex-col">
        <EditorToolbar projectName={project.name} />

        <div className="flex flex-1 overflow-hidden">
          <aside className="flex w-64 shrink-0 flex-col border-r border-(--bor2) bg-(--sur)">
            <SlideLibraryPanel projectId={projectId} files={files} />
          </aside>

          <section className="flex flex-1 items-center justify-center text-xs text-(--t3)">
            Preview Canvas
          </section>

          <aside className="flex w-72 shrink-0 flex-col border-l border-(--bor2) bg-(--sur)">
            <div className="flex flex-1 items-center justify-center text-xs text-(--t3)">
              Properties Panel
            </div>
          </aside>
        </div>

        <EditorStatusBar
          slideIndex={slideFiles.length > 0 ? 1 : 0}
          totalSlides={slideFiles.length}
          selectedElement={null}
          activeLayers={activeLayers}
        />
      </div>
    </EditorProvider>
  );
}
