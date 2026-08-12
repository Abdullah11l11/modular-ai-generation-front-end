import type { Proposal } from '@/features/editor/hooks/useEditorStore';

/** Key under which the active AI proposal is persisted in
 *  sessionStorage. Keyed by projectId so switching projects in the
 *  same tab doesn't leak a stale preview into the next project's
 *  editor. sessionStorage is per-tab; reloading the page clears
 *  it, which is the desired behaviour — proposals are a "within
 *  this session" affordance, not a persistent draft. */
export function proposalStorageKey(projectId: string): string {
  return `mgf:proposal:${projectId}`;
}

/** Shape-guard for the deserialised JSON. Older tabs may have a
 *  stale shape from before the multi-file `Proposal` refactor. */
function isProposal(value: unknown): value is Proposal {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<Proposal>;
  return (
    Number.isFinite(v.messageId) &&
    Array.isArray(v.files) &&
    typeof v.label === 'string'
  );
}

/** Read the persisted proposal for a project, or `null` if none
 *  exists or the stored JSON is malformed. Safe to call on the
 *  server (no-op when `window` is undefined). */
export function readProposal(projectId: string): Proposal | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(proposalStorageKey(projectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isProposal(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Mirror the proposal slice to sessionStorage. Passing `null`
 *  removes the entry. Safe to call on the server. Swallows
 *  quota / disabled-storage errors so the UI never breaks
 *  because of a persistence hiccup. */
export function writeProposal(projectId: string, proposal: Proposal | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (proposal) {
      window.sessionStorage.setItem(proposalStorageKey(projectId), JSON.stringify(proposal));
    } else {
      window.sessionStorage.removeItem(proposalStorageKey(projectId));
    }
  } catch {
    // non-fatal
  }
}
