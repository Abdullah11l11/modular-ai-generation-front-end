import { useEffect, useReducer, type ReactNode } from 'react';
import { EditorContext, editorReducer, initialEditorState } from '@/features/editor/hooks/useEditorStore';
import { readProposal, writeProposal } from '@/features/editor/utils/proposalStorage';
import type { Direction } from '@/types/api';
import type { EditorMode } from '@/features/editor/utils/editorMode';

type EditorProviderProps = {
  children: ReactNode;
  projectId: string;
  projectType: string;
  editorMode: EditorMode;
  direction: Direction;
};

export function EditorProvider({ children, projectId, projectType, editorMode, direction }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, {
    ...initialEditorState,
    projectId,
    projectType,
    editorMode,
    direction,
  });

  // Rehydrate any persisted proposal for this project on mount.
  // Done as a post-mount dispatch (not a lazy initialiser) so the
  // reducer still receives explicit SET_PROPOSAL actions and stays
  // debuggable in React DevTools.
  useEffect(() => {
    const persisted = readProposal(projectId);
    if (persisted) dispatch({ type: 'SET_PROPOSAL', payload: persisted });
    // Run once per projectId — switching projects triggers a
    // remount + fresh rehydrate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Mirror the proposal slice to sessionStorage so closing the
  // AI panel (or clicking around the slide library) doesn't drop
  // the user's pending preview. Other state slices (selectedSlideId,
  // layerVisibility, activeTab) are intentionally NOT persisted —
  // they're session-scoped affordances, not drafts.
  useEffect(() => {
    writeProposal(projectId, state.proposal);
  }, [projectId, state.proposal]);

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}
