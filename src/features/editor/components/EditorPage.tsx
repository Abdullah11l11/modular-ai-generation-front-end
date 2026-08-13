// import { useState } from 'react';
// import { useParams } from 'react-router-dom';

// import { useProject } from '@/features/projects/hooks/useProject';
// import { ProjectSettingsPanel } from '@/features/projects/components/ProjectSettingsPanel';
// import { SlideLibraryPanel } from '@/features/files/components/SlideLibraryPanel';
// import { EditorToolbar } from '@/features/editor/components/EditorToolbar';

// import { FullPageLoader } from '@/components/full-page-loader';
// import { ErrorFallback } from '@/components/error-fallback';

// import type { Id } from '@/types/api';
// import type { ProjectFile } from '@/features/files/types/projectFile';

// export function EditorPage() {
//   const { projectId } = useParams<{
//     projectId: string;
//   }>();

//   const {
//     data: project,
//     isLoading,
//     isError,
//     refetch,
//   } = useProject(projectId as Id);

//   const [settingsOpen, setSettingsOpen] =
//     useState(false);

//   // Active slide
//   const [activeSlideId, setActiveSlideId] =
//     useState<string>();

//   const [activeSlide, setActiveSlide] =
//     useState<ProjectFile>();

//   if (isLoading) {
//     return <FullPageLoader />;
//   }

//   if (isError || !project) {
//     return (
//       <ErrorFallback
//         error={
//           new Error(
//             'Could not load this project. It may have been deleted or you may not have access.',
//           )
//         }
//         reset={() => refetch()}
//       />
//     );
//   }

//   function handleSlideSelect(slide: ProjectFile) {
//     setActiveSlideId(slide.id);
//     setActiveSlide(slide);
//   }

//   return (
//     <div className="flex h-full min-h-0 flex-col">
//       {/* Toolbar */}
//       <EditorToolbar
//         project={project}
//         onOpenSettings={() =>
//           setSettingsOpen(true)
//         }
//       />

//       {/* Editor workspace */}
//       <div className="flex min-h-0 flex-1 overflow-hidden">
//         {/* Left - Slide Library */}
//         <SlideLibraryPanel
//           projectId={projectId as Id}
//           activeSlideId={activeSlideId}
//           onSlideSelect={handleSlideSelect}
//         />

//         {/* Center - Editor Canvas */}
//         <main className="min-w-0 flex-1 overflow-auto">
//           {activeSlide ? (
//             <div className="flex h-full items-center justify-center bg-(--bg2) p-8">
//               <div className="h-full w-full max-w-5xl overflow-hidden rounded-lg border border-(--bor2) bg-white shadow-sm">
//                 <iframe
//                   title={activeSlide.name}
//                   srcDoc={
//                     activeSlide.content ?? ''
//                   }
//                   sandbox=""
//                   className="h-full w-full border-0"
//                 />
//               </div>
//             </div>
//           ) : (
//             <div className="flex h-full items-center justify-center text-sm text-(--t3)">
//               Select a slide to start editing.
//             </div>
//           )}
//         </main>

//         {/* Right - CSS Panel */}
//         <aside className="hidden w-[270px] shrink-0 border-l border-(--bor2) bg-(--bg) lg:block">
//           <div className="p-4">
//             <div className="text-sm font-medium text-(--t1)">
//               CSS Panel
//             </div>

//             <div className="mt-2 text-xs text-(--t3)">
//               Select an element in the preview to edit
//               its styles.
//             </div>
//           </div>
//         </aside>
//       </div>

//       {/* Project Settings */}
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
import { FullPageLoader } from '@/components/full-page-loader';
import { ErrorFallback } from '@/components/error-fallback';
import type { Id } from '@/types/api';

export function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading, isError, refetch } = useProject(projectId as Id);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (isError || !project) {
    return (
      <ErrorFallback
        error={new Error('Could not load this project. It may have been deleted or you may not have access.')}
        reset={() => refetch()}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <EditorToolbar
        project={project}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <div className="flex flex-1 items-center justify-center text-(--t3) text-sm">
        Editor canvas will be built in a future phase.
      </div>

      <ProjectSettingsPanel
        projectId={projectId as Id}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}