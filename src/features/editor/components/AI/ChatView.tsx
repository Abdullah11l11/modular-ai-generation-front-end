import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
import {
  DEFAULT_LMSTUDIO_BASE_URL,
  getEffectiveBaseUrl,
  isLocalBaseUrl,
  setBaseUrlOverride,
  clearBaseUrlOverride,
} from '@/lib/ai/baseUrl';
import { buildSystemPrompt } from '@/lib/ai/prompts';
import { useEditorContext } from '@/features/editor/hooks/useEditorStore';
import {
  fetchAiProviders,
  describeProviderError,
  type UserAiProvider,
} from '@/lib/ai/providersClient';
import type { AIProvider, AIService, ChatMessage } from '@/lib/ai/AIService';

type Props = {
  /** Populate the editor's preview-with-apply proposal state. */
  onPreview: (html: string, messageId: number, label: string) => void;
  /** Bypass preview and commit the extracted HTML straight to the
   *  selected slide. */
  onInsert: (html: string) => void;
};

const SLIDE_INSERT_REGEX = /^---\n[\s\S]*?\n---\n[\s\S]*mgf-slide/;
const SLIDE_BLOCK_REGEX = /<(\w+)[^>]*\bmgf-slide\b[^>]*>[\s\S]*?<\/\1>/;
const HEADING_TEXT_REGEX = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i;

function extractProposalHtml(rawText: string): string | null {
  const m = rawText.match(SLIDE_BLOCK_REGEX);
  return m ? m[0] : null;
}

function extractProposalLabel(rawText: string): string {
  const block = extractProposalHtml(rawText) ?? rawText;
  const m = block.match(HEADING_TEXT_REGEX);
  if (m) return m[1].replace(/<[^>]+>/g, '').trim();
  return 'AI Suggestion';
}

const PREFERRED_PROVIDER_KEY = 'mgf.ai.preferredProviderId';

const readPreferredProviderId = (): string | null =>
  window.localStorage.getItem(PREFERRED_PROVIDER_KEY);

const writePreferredProviderId = (id: string | null) => {
  if (id) window.localStorage.setItem(PREFERRED_PROVIDER_KEY, id);
  else window.localStorage.removeItem(PREFERRED_PROVIDER_KEY);
};

export function ChatView({ onPreview, onInsert }: Props) {
  // AI family selector — only "minimax" or "lmstudio" today.
  // Persisted in component state; not a secret so it's safe to keep
  // here. (No longer routed through apiKeys helpers.)
  const [provider, setProviderState] = useState<AIProvider>('minimax');
  const [providers, setProviders] = useState<UserAiProvider[]>([]);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [providersLoaded, setProvidersLoaded] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(() =>
    readPreferredProviderId(),
  );

  const { state } = useEditorContext();
  const [model, setModel] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);

  // LM Studio-only advanced override (no auth on LM Studio).
  const [baseUrl, setBaseUrlState] = useState(() => getEffectiveBaseUrl('lmstudio'));
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Fetch the user's providers on mount so the picker can populate.
  useEffect(() => {
    const ac = new AbortController();
    fetchAiProviders(ac.signal)
      .then((list) => {
        setProviders(list);
        setProvidersError(null);
        // If the preferred id is missing or stale, fall back to the
        // first active provider.
        const preferred = readPreferredProviderId();
        const stillExists = preferred && list.some((p) => p.id === preferred);
        if (!stillExists) {
          const fallback = list.find((p) => p.is_active) ?? list[0];
          if (fallback) {
            setSelectedProviderId(fallback.id);
            writePreferredProviderId(fallback.id);
            setModel(fallback.default_model ?? minimaxService.suggestedModels[0] ?? '');
          } else {
            setSelectedProviderId(null);
            setModel('');
          }
        } else if (preferred) {
          const row = list.find((p) => p.id === preferred);
          if (row?.default_model) setModel(row.default_model);
        }
      })
      .catch((err) => {
        if (ac.signal.aborted) return;
        setProvidersError(describeProviderError(err));
      })
      .finally(() => {
        if (!ac.signal.aborted) setProvidersLoaded(true);
      });
    return () => ac.abort();
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  // Keep the LM Studio base URL field in sync if the user toggles
  // family. Doesn't touch MiniMax — its base URL lives on the backend.
  useEffect(() => {
    if (provider === 'lmstudio') setBaseUrlState(getEffectiveBaseUrl('lmstudio'));
    // pre-fill model field with the selected provider's default
    if (provider === 'minimax') {
      const row = providers.find((p) => p.id === selectedProviderId);
      setModel(row?.default_model ?? minimaxService.suggestedModels[0] ?? '');
    } else {
      setModel('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, selectedProviderId]);

  const activeRow = useMemo(
    () => providers.find((p) => p.id === selectedProviderId) ?? null,
    [providers, selectedProviderId],
  );

  const noProviders = providersLoaded && providers.length === 0;

  const switchProvider = (next: AIProvider) => {
    setProviderState(next);
    setTestStatus('idle');
  };

  const onSelectProviderId = (id: string) => {
    setSelectedProviderId(id);
    writePreferredProviderId(id);
    const row = providers.find((p) => p.id === id);
    if (row?.default_model) setModel(row.default_model);
  };

  const persistBaseUrl = (url: string) => {
    setBaseUrlState(url);
    if (url && url !== DEFAULT_LMSTUDIO_BASE_URL) {
      setBaseUrlOverride('lmstudio', url);
    } else {
      clearBaseUrlOverride('lmstudio');
    }
  };

  const svcFor = (p: AIProvider): AIService => (p === 'minimax' ? minimaxService : lmstudioService);

  const onTest = async () => {
    setTestStatus('testing');
    const ok = await svcFor(provider).testConnection(baseUrl);
    setTestStatus(ok ? 'ok' : 'fail');
  };

  const send = async () => {
    if (!input.trim() || streaming) return;
    if (provider === 'minimax' && !selectedProviderId) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            '[error] No AI provider selected. Open Settings → AI Providers to add one.',
        },
      ]);
      return;
    }
    const userContent = input.trim();
    setMessages((m) => [...m, { role: 'user', content: userContent }]);
    setInput('');
    setStreaming(true);

    let assistantText = '';
    const baseUrlEffective = provider === 'lmstudio' ? getEffectiveBaseUrl('lmstudio') : undefined;

    const controller = new AbortController();
    abortRef.current = controller;

    setMessages((m) => [...m, { role: 'assistant', content: '' }]);
    try {
      await svcFor(provider).streamChat(
        {
          model,
          system: buildSystemPrompt(),
          messages: [...messages, { role: 'user', content: userContent }],
          providerId: selectedProviderId ?? undefined,
          baseUrl: baseUrlEffective,
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
          <SelectTrigger className="h-7 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minimax">MiniMax</SelectItem>
            <SelectItem value="lmstudio">LM Studio</SelectItem>
          </SelectContent>
        </Select>

        {provider === 'minimax' ? (
          <Select
            value={selectedProviderId ?? ''}
            onValueChange={onSelectProviderId}
            disabled={providers.length === 0}
          >
            <SelectTrigger className="h-7 flex-1 text-xs">
              <SelectValue placeholder={providersLoaded ? 'Select provider…' : 'Loading…'} />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.display_name || p.provider}
                  {p.has_key ? '' : ' (no key)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="model id"
            className="h-7 flex-1 font-mono text-xs"
          />
        )}
      </div>

      {provider === 'minimax' && (
        <div className="flex items-center gap-1">
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={activeRow?.default_model ?? 'model id'}
            className="h-7 flex-1 font-mono text-xs"
          />
        </div>
      )}

      {provider === 'minimax' && noProviders && (
        <div className="rounded-md border border-(--bor2) bg-(--sur1) p-2 text-[11px]">
          <p className="text-(--t2)">
            Add an AI provider in Settings to start chatting.
          </p>
          <Link
            to="/settings/ai-providers"
            className="mt-1 inline-block text-accent underline underline-offset-2"
          >
            Open AI Providers →
          </Link>
        </div>
      )}

      {provider === 'minimax' && providersError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-[11px] text-destructive">
          Couldn't load providers: {providersError}
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-md border border-(--bor2) bg-(--bg) p-2"
      >
        {messages.length === 0 && (
          <p className="text-(--t3) text-[11px]">
            Ask anything. AI responses that match the mgf-* slide grammar get an Insert button.
          </p>
        )}
        {messages.map((m, i) => {
          const isAssistant = m.role === 'assistant';
          const matchesSlideGrammar = isAssistant && SLIDE_INSERT_REGEX.test(m.content);
          const isPreviewing =
            isAssistant && state.proposal !== null && state.proposal.messageId === i;
          return (
            <div key={i} className={`mb-2 ${isAssistant ? 'text-left' : 'text-right'}`}>
              <div
                className={`inline-block max-w-[90%] whitespace-pre-wrap rounded-md px-2 py-1 ${
                  isAssistant ? 'bg-(--sur1)' : 'bg-(--sur2)'
                }`}
              >
                {m.content || (streaming && i === messages.length - 1 ? '▍' : '')}
              </div>
              {matchesSlideGrammar && !streaming && (
                <div className="mt-1 flex items-center gap-1.5 text-left">
                  <Button
                    type="button"
                    variant={isPreviewing ? 'accent' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const html = extractProposalHtml(m.content);
                      if (!html) return;
                      onPreview(html, i, extractProposalLabel(m.content));
                    }}
                    data-testid="chat-preview-button"
                  >
                    {isPreviewing ? '✓ Previewing' : '👁 Preview'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const html = extractProposalHtml(m.content);
                      if (!html) return;
                      onInsert(html);
                    }}
                    data-testid="chat-insert-button"
                    title="Apply directly without preview"
                  >
                    ⤴ Insert
                  </Button>
                </div>
              )}
            </div>
          );
        })}
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

      {provider === 'lmstudio' && (
        <details className="rounded-md border border-(--bor2) p-2">
          <summary className="cursor-pointer text-(--t3) text-[11px] select-none">
            LM Studio settings
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="chat-baseurl" className="text-[11px] text-(--t3)">
                Base URL
              </label>
              <Input
                id="chat-baseurl"
                value={baseUrl}
                onChange={(e) => persistBaseUrl(e.target.value)}
                className="h-7 font-mono text-[11px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onTest}
                disabled={testStatus === 'testing'}
              >
                {testStatus === 'testing' ? 'Testing…' : 'Test connection'}
              </Button>
              {testStatus === 'ok' && <span className="text-accent text-[11px]">Reachable ✓</span>}
              {testStatus === 'fail' && (
                <span className="text-destructive text-[11px]">
                  {isLocalBaseUrl(baseUrl) ? 'Not reachable' : 'CORS or unreachable'}
                </span>
              )}
            </div>
          </div>
        </details>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={resetChat}
          className="text-(--t3) text-[11px] underline underline-offset-2"
        >
          Clear chat
        </button>
        <Link
          to="/settings/ai-providers"
          className="text-(--t3) text-[11px] underline underline-offset-2"
        >
          Manage providers →
        </Link>
      </div>
    </div>
  );
}
