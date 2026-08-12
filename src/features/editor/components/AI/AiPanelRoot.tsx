import { useState } from 'react';
import { KeySetupView } from './KeySetupView';
import { ChatView } from './ChatView';
import { getProvider, getKey } from '@/lib/ai/apiKeys';
import type { AIProvider } from '@/lib/ai/AIService';

type Props = {
  onPreview: (html: string, messageId: number, label: string) => void;
  onInsert: (html: string) => void;
};

export function AiPanelRoot({ onPreview, onInsert }: Props) {
  const [provider, setProvider] = useState<AIProvider>(getProvider());
  const [hasKey, setHasKey] = useState<boolean>(() => {
    if (provider === 'lmstudio') return true;
    return !!getKey(provider);
  });

  const onSaved = () => setHasKey(true);

  if (!hasKey) {
    return <KeySetupView provider={provider} onProviderChange={setProvider} onSaved={onSaved} />;
  }
  return <ChatView onPreview={onPreview} onInsert={onInsert} />;
}
