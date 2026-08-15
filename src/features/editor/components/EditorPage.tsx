// import { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { useProject } from '@/features/projects/hooks/useProject';
// import { ProjectSettingsPanel } from '@/features/projects/components/ProjectSettingsPanel';
// import { FullPageLoader } from '@/components/full-page-loader';
// import { ErrorFallback } from '@/components/error-fallback';
// import type { Id, Project } from '@/types/api';
// import { Button } from '@/components/ui/button';
// import { ExportDialog } from '@/features/export/components/ExportDialog';

// interface EditorToolbarProps {
//   project: Project;
//   projectId: string;
//   onOpenSettings: () => void;
// }

// export function EditorToolbar({
//   project,
//   projectId,
//   onOpenSettings,
// }: EditorToolbarProps) {
//   const [exportOpen, setExportOpen] =
//     useState(false);

//   return (
//     <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
//       <div className="text-sm font-medium text-foreground">
//         {project.name}
//       </div>

//       <div className="flex items-center gap-2">
//         <Button variant="outline" onClick={onOpenSettings}>
//           Settings
//         </Button>

//         <Button
//           variant="outline"
//           onClick={() => setExportOpen(true)}
//         >
//           Export
//         </Button>
//       </div>

//       <ExportDialog
//         projectId={projectId}
//         open={exportOpen}
//         onOpenChange={setExportOpen}
//       />
//     </div>
//   );
// }
// export function EditorPage() {
//   const { projectId } = useParams<{ projectId: string }>();
//   const { data: project, isLoading, isError, refetch } = useProject(projectId as Id);
//   const [settingsOpen, setSettingsOpen] = useState(false);

//   if (isLoading) {
//     return <FullPageLoader />;
//   }

//   if (isError || !project) {
//     return (
//       <ErrorFallback
//         error={new Error('Could not load this project. It may have been deleted or you may not have access.')}
//         reset={() => refetch()}
//       />
//     );
//   }

//   return (
//     <div className="flex h-full flex-col">
//       <EditorToolbar
//         project={project}
//         projectId={projectId as Id}
//         onOpenSettings={() => setSettingsOpen(true)}
//       />
//       <div className="flex flex-1 items-center justify-center text-(--t3) text-sm">
//         Editor canvas will be built in a future phase.
//       </div>

//       <ProjectSettingsPanel
//         projectId={projectId as Id}
//         open={settingsOpen}
//         onOpenChange={setSettingsOpen}
//       />
//     </div>
//   );
// }
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { useProject } from '@/features/projects/hooks/useProject';
import { EditorToolbar } from '@/features/editor/components/EditorToolbar';
import { ProjectSettingsPanel } from '@/features/projects/components/ProjectSettingsPanel';
import { ExportDialog } from '@/features/export/components/ExportDialog';

import { FullPageLoader } from '@/components/full-page-loader';
import { ErrorFallback } from '@/components/error-fallback';

import type { Id } from '@/types/api';

export function EditorPage() {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const {
    data: project,
    isLoading,
    isError,
    refetch,
  } = useProject(projectId as Id);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (isError || !project) {
    return (
      <ErrorFallback
        error={
          new Error(
            'Could not load this project. It may have been deleted or you may not have access.',
          )
        }
        reset={() => refetch()}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <EditorToolbar
        project={project}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenExport={() => setExportOpen(true)}
      />

      <div className="flex flex-1 items-center justify-center text-sm text-(--t3)">
        Editor canvas will be built in a future phase.
      </div>

      <ProjectSettingsPanel
        projectId={project.id}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />

      <ExportDialog
        projectId={project.id}
        open={exportOpen}
        onOpenChange={setExportOpen}
      />
    </div>
  );
}