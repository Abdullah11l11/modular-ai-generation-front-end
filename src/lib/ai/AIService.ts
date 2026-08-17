/**
 * Unified browser-direct AI service abstraction.
 * Two implementations: MiniMax (Anthropic-compatible) and LM Studio (OpenAI-compatible).
 * Streaming only — non-streaming is not supported.
 */

export type AIProvider = 'minimax' | 'lmstudio';

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type StreamChatParams = {
  model: string;
  system: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
  /** Required for the `minimax` family. Backend row id of the user's
   *  MiniMax/Anthropic/OpenAI/etc. provider — the backend reads the
   *  encrypted API key for this row. Ignored by `lmstudio`. */
  providerId?: string;
  /** Optional override for the provider's base URL (Advanced UI). */
  baseUrl?: string;
  /** When true, route through the same-origin Vercel proxy (api/chat.ts or api/lmstudio.ts). */
  useProxy?: boolean;
  /** Override for the upstream `max_tokens`. Defaults to 4096 inside
   *  the provider (which is plenty for single-file regeneration
   *  tasks). Tasks that emit a lot of output — e.g. the
   *  "Generate full project" page, which has to return
   *  style.css + layout.css + every slide-NN.html + data.json —
   *  must override this or the AI's reply gets truncated mid-JSON
   *  and the parser fails. */
  maxTokens?: number;
};

export type StreamChatHandlers = {
  onDelta: (text: string) => void;
  onDone: (full: string) => void;
  onError: (err: Error) => void;
};

export type AIService = {
  readonly provider: AIProvider;
  streamChat: (params: StreamChatParams, handlers: StreamChatHandlers) => Promise<void>;
  /** Returns true if the provider is reachable (no auth required for LM Studio). */
  testConnection: (baseUrl?: string, signal?: AbortSignal) => Promise<boolean>;
  /** Suggested model names for the UI dropdown. */
  suggestedModels: readonly string[];
};
