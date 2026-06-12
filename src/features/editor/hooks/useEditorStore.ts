import { createContext, useContext, type Dispatch } from 'react';
import type { ProjectFileKind, Id } from '@/types/api';

export type ActiveTab = 'theme' | 'content' | 'style' | 'ai';

export type LayerVisibility = Record<ProjectFileKind, boolean>;

export type EditorState = {
  projectId: Id;
  selectedSlideId: Id | null;
  selectedElement: string | null;
  layerVisibility: LayerVisibility;
  activeTab: ActiveTab;
  isGenerating: boolean;
};

export const defaultLayerVisibility: LayerVisibility = {
  slide: true,
  style: true,
  layout: true,
  content: true,
  context: true,
  rules: true,
  meta: true,
  sequence: true,
};

export type EditorAction =
  | { type: 'SET_PROJECT_ID'; payload: Id }
  | { type: 'SET_SELECTED_SLIDE'; payload: Id | null }
  | { type: 'SET_SELECTED_ELEMENT'; payload: string | null }
  | { type: 'TOGGLE_LAYER'; payload: ProjectFileKind }
  | { type: 'SET_ACTIVE_TAB'; payload: ActiveTab }
  | { type: 'SET_IS_GENERATING'; payload: boolean };

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_PROJECT_ID':
      return { ...state, projectId: action.payload };
    case 'SET_SELECTED_SLIDE':
      return { ...state, selectedSlideId: action.payload };
    case 'SET_SELECTED_ELEMENT':
      return { ...state, selectedElement: action.payload };
    case 'TOGGLE_LAYER':
      return {
        ...state,
        layerVisibility: {
          ...state.layerVisibility,
          [action.payload]: !state.layerVisibility[action.payload],
        },
      };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_IS_GENERATING':
      return { ...state, isGenerating: action.payload };
    default:
      return state;
  }
}

export type EditorContextValue = {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
};

export const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditorStore() {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error('useEditorStore must be used within an EditorProvider');
  }

  return context;
}
