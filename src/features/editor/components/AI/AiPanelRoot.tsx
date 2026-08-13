import { ChatView } from './ChatView';

type Props = {
  onPreview: (html: string, messageId: number, label: string) => void;
  onInsert: (html: string) => void;
};

/**
 * Root of the AI side panel. The chat surface is always rendered —
 * when the user has no AI providers, the chat shows an inline
 * "add a provider" notice with a link to Settings. (Per the handoff
 * doc, the API key is no longer stored in the browser, so there is
 * no in-panel "enter your key" flow.)
 */
export function AiPanelRoot({ onPreview, onInsert }: Props) {
  return <ChatView onPreview={onPreview} onInsert={onInsert} />;
}
