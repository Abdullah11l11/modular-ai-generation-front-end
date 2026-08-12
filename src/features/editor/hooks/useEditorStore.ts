import { createContext, useContext, type Dispatch } from 'react';
import type { ProjectFileKind, Direction } from '@/types/api';
import type { EditorMode } from '@/features/editor/utils/editorMode';

export type ActiveTab = 'theme' | 'content' | 'style' | 'ai';

const ALL_KINDS: ProjectFileKind[] = [
  'slide', 'style', 'layout', 'content', 'context', 'rules', 'meta', 'asset',
];

const defaultLayerVisibility = Object.fromEntries(
  ALL_KINDS.map((k) => [k, true]),
) as Record<ProjectFileKind, boolean>;

export type LayerVisibility = Record<ProjectFileKind, boolean>;

/**
 * Shadow preview state for an AI-suggested change. While `proposal`
 * is non-null the editor canvas renders against this HTML instead
 * of the live files. The user can Apply (commit to backend) or
 * Discard (drop it). No file system side effects fire until Apply.
 */
export type Proposal = {
  /** Index of the assistant message that produced this proposal —
   *  used by ChatView to render the ✓ preview badge on the right
   *  message. */
  messageId: number;
  /** Full HTML block to render in the preview canvas. */
  html: string;
  /** Short label for the banner ("Proposal: Hero Section"). */
  label: string;
};

export type EditorState = {
  projectId: string;
  projectType: string;
  editorMode: EditorMode;
  direction: Direction;
  selectedSlideId: string | null;
  selectedElement: string | null;
  layerVisibility: LayerVisibility;
  activeTab: ActiveTab;
  isGenerating: boolean;
  proposal: Proposal | null;
};

export type EditorAction =
  | { type: 'SET_PROJECT_ID'; payload: string }
  | { type: 'SET_PROJECT_TYPE'; payload: string }
  | { type: 'SET_EDITOR_MODE'; payload: EditorMode }
  | { type: 'SET_DIRECTION'; payload: Direction }
  | { type: 'SET_SELECTED_SLIDE_ID'; payload: string | null }
  | { type: 'SET_SELECTED_ELEMENT'; payload: string | null }
  | { type: 'TOGGLE_LAYER'; payload: ProjectFileKind }
  | { type: 'SET_ACTIVE_TAB'; payload: ActiveTab }
  | { type: 'SET_IS_GENERATING'; payload: boolean }
  | { type: 'SET_PROPOSAL'; payload: Proposal }
  | { type: 'CLEAR_PROPOSAL' }
  | { type: 'APPLY_PROPOSAL' };

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_PROJECT_ID':
      return { ...state, projectId: action.payload };
    case 'SET_PROJECT_TYPE':
      return { ...state, projectType: action.payload };
    case 'SET_EDITOR_MODE':
      return { ...state, editorMode: action.payload };
    case 'SET_DIRECTION':
      return { ...state, direction: action.payload };
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
    case 'SET_PROPOSAL':
      return { ...state, proposal: action.payload };
    case 'CLEAR_PROPOSAL':
      return { ...state, proposal: null };
    case 'APPLY_PROPOSAL':
      // The store only clears the shadow state here. The actual
      // file-system mutation (PUT to the backend) lives in the
      // component that owns the apply handler (EditorPage) so it
      // has access to TanStack Query + the selected slide ID.
      return { ...state, proposal: null };
    default:
      return state;
  }
}

export const initialEditorState: EditorState = {
  projectId: '',
  projectType: '',
  editorMode: 'per-slide',
  direction: 'ltr',
  selectedSlideId: null,
  selectedElement: null,
  layerVisibility: defaultLayerVisibility,
  activeTab: 'theme',
  isGenerating: false,
  proposal: null,
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
