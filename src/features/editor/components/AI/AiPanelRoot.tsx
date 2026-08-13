import { useState } from 'react';
import { ChatView } from './ChatView';
import { RegenerateStyleModal } from './modals/RegenerateStyleModal';
import { RegenerateContentModal } from './modals/RegenerateContentModal';
import { RegenerateStructureModal } from './modals/RegenerateStructureModal';

type Props = {
  projectId: string;
  onPreview: (html: string, messageId: number, label: string) => void;
  onInsert: (html: string) => void;
};

/**
 * Root of the AI side panel. The chat surface is always rendered —
 * when the user has no AI providers, the chat shows an inline
 * "add a provider" notice with a link to Settings. (Per the handoff
 * doc, the API key is no longer stored in the browser, so there is
 * no in-panel "enter your key" flow.)
 *
 * Above the chat, three modular buttons open the per-layer modals:
 *   - ✦ CSS      → `RegenerateStyleModal`
 *   - ✦ Content  → `RegenerateContentModal`
 *   - ✦ Structure→ `RegenerateStructureModal`
 *
 * Each modal is self-contained: it owns its own AI call, parser,
 * proposal build, and apply path. Closing one cannot affect the
 * others.
 */
export function AiPanelRoot({ projectId, onPreview, onInsert }: Props) {
  const [styleOpen, setStyleOpen] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);
  const [structureOpen, setStructureOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 gap-1 border-b border-(--bor2) p-2">
        <button
          type="button"
          className="flex-1 rounded-md border border-(--bor2) bg-(--sur1) px-2 py-1 text-[11px] font-medium hover:bg-(--sur2) disabled:opacity-50"
          onClick={() => setStyleOpen(true)}
          data-testid="ai-btn-regen-css"
        >
          ✦ CSS
        </button>
        <button
          type="button"
          className="flex-1 rounded-md border border-(--bor2) bg-(--sur1) px-2 py-1 text-[11px] font-medium hover:bg-(--sur2) disabled:opacity-50"
          onClick={() => setContentOpen(true)}
          data-testid="ai-btn-regen-content"
        >
          ✦ Content
        </button>
        <button
          type="button"
          className="flex-1 rounded-md border border-(--bor2) bg-(--sur1) px-2 py-1 text-[11px] font-medium hover:bg-(--sur2) disabled:opacity-50"
          onClick={() => setStructureOpen(true)}
          data-testid="ai-btn-regen-structure"
        >
          ✦ Structure
        </button>
      </div>

      <div className="min-h-0 flex-1">
        <ChatView onPreview={onPreview} onInsert={onInsert} />
      </div>

      <RegenerateStyleModal
        projectId={projectId}
        open={styleOpen}
        onOpenChange={setStyleOpen}
      />
      <RegenerateContentModal
        projectId={projectId}
        open={contentOpen}
        onOpenChange={setContentOpen}
      />
      <RegenerateStructureModal
        projectId={projectId}
        open={structureOpen}
        onOpenChange={setStructureOpen}
      />
    </div>
  );
}
