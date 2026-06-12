import { useReducer, type ReactNode } from 'react';
import {
  EditorContext,
  editorReducer,
  defaultLayerVisibility,
} from '@/features/editor/hooks/useEditorStore';
import type { Id } from '@/types/api';

type EditorProviderProps = {
  projectId: Id;
  children: ReactNode;
};

export function EditorProvider({ projectId, children }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, {
    projectId,
    selectedSlideId: null,
    selectedElement: null,
    layerVisibility: defaultLayerVisibility,
    activeTab: 'theme',
    isGenerating: false,
  });

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}
