import { useReducer, type ReactNode } from 'react';
import { EditorContext, editorReducer, initialEditorState } from '@/features/editor/hooks/useEditorStore';

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}
