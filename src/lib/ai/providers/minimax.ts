import type { AIService, StreamChatHandlers, StreamChatParams } from '../AIService';
import { getEffectiveBaseUrl } from '../baseUrl';
import { env } from '@/config/env';

/**
 * MiniMax / Anthropic-compatible provider.
 *
 * All requests go through the Laravel backend endpoint `POST /api/v1/ai/chat`
 * (Task 2026-08-13 backend-ai-proxy). The Anthropic API key is server-held
 * and never reaches the browser. The backend forwards the Anthropic SSE
 * stream verbatim, so this client parses the same `content_block_delta` /
 * `message_stop` events as a direct call would.
 *
 * The provider's `baseUrl` advanced-override is no longer used for the
 * network request (Laravel owns the upstream URL), but `getEffectiveBaseUrl`
 * is still called so the chat panel's base-URL field stays in sync with
 * the active provider.
 */
export const minimaxService: AIService = {
  provider: 'minimax',
  suggestedModels: [
    'MiniMax-M2.7',
    'MiniMax-M2.5',
    'MiniMax-M2.1',
    'MiniMax-M2',
    'claude-3-5-sonnet-latest',
    'claude-3-5-haiku-latest',
  ],

  async streamChat(params: StreamChatParams, handlers: StreamChatHandlers): Promise<void> {
    // baseUrl is intentionally NOT used for the network request — the
    // backend uses its own ANTHROPIC_BASE_URL. Still touch the getter so
    // the chat panel's base-URL field stays in sync with the active
    // provider.
    getEffectiveBaseUrl('minimax');

    const url = `${env.apiBaseUrl}/ai/chat`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          model: params.model,
          system: params.system,
          messages: params.messages,
          max_tokens: 4096,
        }),
        signal: params.signal,
      });
    } catch (err) {
      handlers.onError(err instanceof Error ? err : new Error(String(err)));
      return;
    }

    if (!response.ok) {
      let detail = '';
      try {
        const body = (await response.json()) as { error?: string };
        if (body?.error) detail = ` — ${body.error}`;
      } catch {
        // ignore non-JSON bodies
      }
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
    // The browser can't reach the Anthropic API directly (no key); the
    // "connection" we can verify is whether the backend endpoint responds
    // at all. A 401 still means the route is reachable — we treat any
    // non-network error as a pass.
    const url = `${env.apiBaseUrl}/ai/chat`;
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-latest',
          messages: [{ role: 'user', content: 'ping' }],
        }),
        signal,
      });
      // 422 (validation), 401 (unauthenticated), 502 (key missing) all
      // prove the route is wired. 404 or a network error means broken.
      return r.status !== 404 && r.status !== 0;
    } catch {
      return false;
    }
  },
};

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
        const line = event.split('\n').find((l) => l.startsWith('data:'));
        if (!line) continue;
        const data = line.slice(5).trim();
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
            handlers.onError(new Error(json.error?.message ?? 'MiniMax stream error'));
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
