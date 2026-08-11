import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { minimaxService } from '@/lib/ai/providers/minimax';
import { lmstudioService } from '@/lib/ai/providers/lmstudio';
import { getProvider, setProvider, clearKey, getUseProxy } from '@/lib/ai/apiKeys';
import { getEffectiveBaseUrl } from '@/lib/ai/baseUrl';
import { buildSystemPrompt } from '@/lib/ai/prompts';
import type { AIProvider, ChatMessage } from '@/lib/ai/AIService';

type Props = {
  onInsertIntoEditor: (text: string) => void;
};

const SLIDE_INSERT_REGEX = /^---\n[\s\S]*?\n---\n[\s\S]*mgf-slide/;

export function ChatView({ onInsertIntoEditor }: Props) {
  const [provider, setLocalProvider] = useState<AIProvider>(() => getProvider());
  const [model, setModel] = useState(() => {
    const svc = getProvider() === 'minimax' ? minimaxService : lmstudioService;
    return svc.suggestedModels[0] ?? '';
  });
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  const switchProvider = (next: AIProvider) => {
    setLocalProvider(next);
    setProvider(next);
    setModel(next === 'minimax' ? minimaxService.suggestedModels[0] : '');
  };

  const send = async () => {
    if (!input.trim() || streaming) return;
    const userContent = input.trim();
    setMessages((m) => [...m, { role: 'user', content: userContent }]);
    setInput('');
    setStreaming(true);

    let assistantText = '';
    const svc = provider === 'minimax' ? minimaxService : lmstudioService;
    const baseUrl = getEffectiveBaseUrl(provider);

    const controller = new AbortController();
    abortRef.current = controller;

    setMessages((m) => [...m, { role: 'assistant', content: '' }]);
    try {
      await svc.streamChat(
        {
          model,
          system: buildSystemPrompt(),
          messages: [...messages, { role: 'user', content: userContent }],
          baseUrl,
          useProxy: getUseProxy(),
          signal: controller.signal,
        },
        {
          onDelta: (text) => {
            assistantText += text;
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = { role: 'assistant', content: assistantText };
              return copy;
            });
          },
          onDone: (full) => {
            if (abortRef.current === controller) abortRef.current = null;
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = { role: 'assistant', content: full };
              return copy;
            });
            setStreaming(false);
          },
          onError: (err) => {
            if (abortRef.current === controller) abortRef.current = null;
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = {
                role: 'assistant',
                content: `[error] ${err instanceof Error ? err.message : String(err)}`,
              };
              return copy;
            });
            setStreaming(false);
          },
        },
      );
    } catch (err) {
      if (abortRef.current === controller) abortRef.current = null;
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: 'assistant',
          content: `[error] ${err instanceof Error ? err.message : String(err)}`,
        };
        return copy;
      });
      setStreaming(false);
    }
  };

  const resetChat = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
  };

  return (
    <div className="flex h-full flex-col gap-2 text-xs">
      <div className="flex items-center gap-1">
        <Select value={provider} onValueChange={(v) => switchProvider(v as AIProvider)}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minimax">MiniMax</SelectItem>
            <SelectItem value="lmstudio">LM Studio</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="model id"
          className="h-7 font-mono text-xs"
        />
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-md border border-(--bor2) bg-(--bg) p-2"
      >
        {messages.length === 0 && (
          <p className="text-(--t3) text-[11px]">
            Ask anything. AI responses that match the mgf-* slide grammar get an Insert button.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div
              className={`inline-block max-w-[90%] whitespace-pre-wrap rounded-md px-2 py-1 ${
                m.role === 'user' ? 'bg-(--sur2)' : 'bg-(--sur1)'
              }`}
            >
              {m.content || (streaming && i === messages.length - 1 ? '▍' : '')}
            </div>
            {m.role === 'assistant' && SLIDE_INSERT_REGEX.test(m.content) && !streaming && (
              <div className="mt-1 text-left">
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  onClick={() => onInsertIntoEditor(m.content)}
                >
                  Insert into editor
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Describe what you want…"
          className="h-7 text-xs"
          disabled={streaming}
        />
        <Button
          type="button"
          variant="accent"
          size="sm"
          onClick={send}
          disabled={streaming || !input.trim()}
        >
          {streaming ? '…' : 'Send'}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={resetChat}
          className="text-(--t3) text-[11px] underline underline-offset-2"
        >
          Clear chat
        </button>
        <button
          type="button"
          onClick={() => {
            abortRef.current?.abort();
            abortRef.current = null;
            if (provider === 'minimax') clearKey('minimax');
            resetChat();
          }}
          className="text-(--t3) text-[11px] underline underline-offset-2"
        >
          Reset key
        </button>
      </div>
    </div>
  );
}
