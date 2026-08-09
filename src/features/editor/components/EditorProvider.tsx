import { useReducer, type ReactNode } from 'react';
import { EditorContext, editorReducer, initialEditorState } from '@/features/editor/hooks/useEditorStore';
import type { Direction } from '@/types/api';
import type { EditorMode } from '@/features/editor/utils/editorMode';

type EditorProviderProps = {
  children: ReactNode;
  projectId: string;
  editorMode: EditorMode;
  direction: Direction;
};

export function EditorProvider({ children, projectId, editorMode, direction }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, {
    ...initialEditorState,
    projectId,
    editorMode,
    direction,
  });

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}
