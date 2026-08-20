import type { AIService, StreamChatHandlers, StreamChatParams } from '../AIService';
import { env } from '@/config/env';

const AUTH_TOKEN_KEY = 'mgf.authToken';

const readAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * MiniMax / Anthropic-compatible provider.
 *
 * All requests go through the Laravel backend `POST /api/v1/ai/chat`
 * (handoff doc: `01_MGF_BACKEND/docs/FRONTEND_AI_CHAT_HANDOFF.md`).
 *
 * - The browser sends `provider_id` so the backend knows which
 *   per-user encrypted key to use (each user has their own row in
 *   `user_ai_providers`; the key never leaves the server).
 * - Sanctum Bearer token from `localStorage['mgf.authToken']` is
 *   attached manually because we use raw `fetch()` (axios doesn't
 *   stream SSE well).
 * - The backend forwards the Anthropic SSE stream verbatim, so this
 *   client parses the same `content_block_delta` / `message_stop`
 *   events as a direct call would.
 */
export const minimaxService: AIService = {
  provider: 'minimax',
  suggestedModels: [
    // MiniMax-M3 is the default model used by the MiniMax-compatible Anthropic
    // proxy (matches ANTHROPIC_DEFAULT_*_MODEL in the user's env).
    'MiniMax-M3',
    'claude-3-5-sonnet-latest',
    'claude-3-5-haiku-latest',
  ],

  async streamChat(params: StreamChatParams, handlers: StreamChatHandlers): Promise<void> {
    const providerId = params.providerId;
    if (!providerId) {
      handlers.onError(
        new Error('No provider selected. Open Settings → AI Providers to add one.'),
      );
      return;
    }

    const token = readAuthToken();
    if (!token) {
      handlers.onError(new Error('Not signed in. Sign in and try again.'));
      return;
    }

    const url = `${env.apiBaseUrl}/ai/chat`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider_id: providerId,
          model: params.model,
          system: params.system,
          messages: params.messages,
          // Default to 4096 — that's plenty for single-file regeneration
          // (style.css / data.json / a few slide blocks). The full-project
          // generation task passes a larger override because it has to emit
          // many files in one reply; without it the AI's JSON gets cut
          // mid-string and the parser throws "not parseable as JSON".
          max_tokens: params.maxTokens ?? 4096,
        }),
        signal: params.signal,
      });
    } catch (err) {
      handlers.onError(err instanceof Error ? err : new Error(String(err)));
      return;
    }

    if (!response.ok) {
      const detail = await readErrorDetail(response);
      handlers.onError(new Error(`MiniMax request failed: HTTP ${response.status}${detail}`));
      return;
    }

    if (!response.body) {
      handlers.onError(new Error('MiniMax stream ended without a body'));
      return;
    }

    await consumeAnthropicSse(response.body, handlers);
  },

  async testConnection(_baseUrl?: string, signal?: AbortSignal): Promise<boolean> {
    // We can't actually probe the chat endpoint without sending a real
    // prompt + provider_id — just confirm the backend route is wired
    // and the auth header is accepted. A 4xx response means the route
    // is reachable + authenticated; only a network failure or 5xx
    // means "unreachable".
    const token = readAuthToken();
    if (!token) return false;
    const url = `${env.apiBaseUrl}/ai/chat`;
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider_id: '00000000-0000-0000-0000-000000000000',
          messages: [{ role: 'user', content: 'ping' }],
        }),
        signal,
      });
      return r.status >= 400 && r.status < 500;
    } catch {
      return false;
    }
  },
};

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string;
      code?: string;
      error?: string;
    };
    if (body?.message) {
      const code = body.code ? ` [${body.code}]` : '';
      return ` — ${body.message}${code}`;
    }
    if (body?.error) return ` — ${body.error}`;
  } catch {
    // ignore non-JSON bodies
  }
  return '';
}

async function consumeAnthropicSse(
  body: ReadableStream<Uint8Array>,
  handlers: StreamChatHandlers,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';
      for (const event of events) {
        const dataLine = event
          .split('\n')
          .find((l) => l.startsWith('data:'));
        if (!dataLine) continue;
        const data = dataLine.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const json = JSON.parse(data);
          if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
            const text: string = json.delta.text ?? '';
            full += text;
            handlers.onDelta(text);
          } else if (json.type === 'message_stop') {
            handlers.onDone(full);
            return;
          } else if (json.type === 'error') {
            const msg =
              json.error?.message ?? json.message ?? 'MiniMax stream error';
            handlers.onError(new Error(msg));
            return;
          }
        } catch {
          // ignore malformed lines
        }
      }
    }
    handlers.onDone(full);
  } catch (err) {
    handlers.onError(err instanceof Error ? err : new Error(String(err)));
  } finally {
    reader.releaseLock();
  }
}
