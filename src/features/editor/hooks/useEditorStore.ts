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
 * A single file change inside an AI proposal. The Apply handler
 * looks up `name + layer` in the live project files; if it finds
 * a match it PUTs the new content, otherwise it POSTs a new file.
 *
 * `name` is optional — when omitted, the parent (EditorPage) falls
 * back to the currently selected slide's name. This is the common
 * case for AI suggestions that just rewrite "the current slide".
 */
export type ProposalFile = {
  layer: ProjectFileKind;
  content: string;
  /** Omit to apply to the currently selected slide (per-slide mode)
   *  or the project's content.html (single-page mode). */
  name?: string;
  /** File extension without the dot, used when creating a new
   *  file. Defaults to `html` for the `slide` layer, `css` for
   *  `style`/`layout`, `json` for `content`. */
  extension?: string;
};

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
  /** The set of file changes to commit on Apply. For Task 3.3
   *  this is always exactly one entry (the extracted slide HTML)
   *  but the array is multi-file-aware so future prompts that
   *  return a full slide bundle can flow through unchanged. */
  files: ProposalFile[];
  /** Short label for the banner ("Proposal: Hero Section"). */
  label: string;
  /** Optional pre-rendered HTML for the banner. When set the
   *  PreviewCanvas renders this directly; otherwise it falls
   *  back to `files[0].content`. Kept separate from `files` so
   *  the rendered preview can include BASE_CSS / style.css even
   *  when the proposal itself is a raw block. */
  previewHtml?: string;
  /** Optional layer swap for the live preview. When set, the
   *  PreviewCanvas re-runs `assemblePreviewHtml` with the live
   *  slide HTML but the proposed `content` swapped in for the
   *  matching layer (`style` → `styleCss`, `content` → `contentJson`).
   *  Lets the user SEE the CSS / JSON change applied to the live
   *  project before committing. The actual write goes through
   *  `files[]` on Apply. */
  override?: {
    kind: 'style' | 'content';
    content: string;
  };
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
