// import {
//   createContext,
//   useContext,
//   useState,
// } from 'react';

// import type { ProjectFile } from '@/features/files/types/projectFile';

// interface EditorContextValue {
//   activeSlideId?: string;
//   activeSlide?: ProjectFile;
//   setActiveSlide: (slide: ProjectFile) => void;
// }

// const EditorContext =
//   createContext<EditorContextValue | null>(null);

// export function EditorProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [activeSlide, setActiveSlideState] =
//     useState<ProjectFile>();

//   function setActiveSlide(slide: ProjectFile) {
//     setActiveSlideState(slide);
//   }

//   return (
//     <EditorContext.Provider
//       value={{
//         activeSlideId: activeSlide?.id,
//         activeSlide,
//         setActiveSlide,
//       }}
//     >
//       {children}
//     </EditorContext.Provider>
//   );
// }

// export function useEditor() {
//   const context = useContext(EditorContext);

//   if (!context) {
//     throw new Error(
//       'useEditor must be used inside EditorProvider',
//     );
//   }

//   return context;
// }