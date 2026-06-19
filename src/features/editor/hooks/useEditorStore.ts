import { createContext, useContext, type Dispatch } from 'react';
import type { ProjectFileKind } from '@/types/api';

const ALL_KINDS: ProjectFileKind[] = [
  'slide', 'style', 'layout', 'content', 'context', 'rules', 'meta', 'asset',
];

const defaultLayerVisibility = Object.fromEntries(
  ALL_KINDS.map((k) => [k, true]),
) as Record<ProjectFileKind, boolean>;

export type ActiveTab = 'theme' | 'content' | 'style' | 'ai';

export type LayerVisibility = Record<ProjectFileKind, boolean>;

export type EditorState = {
  projectId: string;
  selectedSlideId: string | null;
  selectedElement: string | null;
  layerVisibility: LayerVisibility;
  activeTab: ActiveTab;
  isGenerating: boolean;
};

export type EditorAction =
  | { type: 'SET_PROJECT_ID'; payload: string }
  | { type: 'SET_SELECTED_SLIDE_ID'; payload: string | null }
  | { type: 'SET_SELECTED_ELEMENT'; payload: string | null }
  | { type: 'TOGGLE_LAYER'; payload: ProjectFileKind }
  | { type: 'SET_ACTIVE_TAB'; payload: ActiveTab }
  | { type: 'SET_IS_GENERATING'; payload: boolean };

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_PROJECT_ID':
      return { ...state, projectId: action.payload };
    case 'SET_SELECTED_SLIDE_ID':
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

export const initialEditorState: EditorState = {
  projectId: '',
  selectedSlideId: null,
  selectedElement: null,
  layerVisibility: defaultLayerVisibility,
  activeTab: 'theme',
  isGenerating: false,
};

type EditorContextValue = {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
};

export const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditorContext(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return ctx;
}
