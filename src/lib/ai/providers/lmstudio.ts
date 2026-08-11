import type { AIService, StreamChatHandlers, StreamChatParams } from '../AIService';
import { getEffectiveBaseUrl } from '../baseUrl';

/**
 * LM Studio local OpenAI-compatible provider.
 * No auth. Direct mode: POST {baseUrl} with `{model, messages, stream: true}`.
 * Proxy mode (`useProxy: true`): POST `/api/lmstudio` with `{baseUrl, model, messages}` — the Vercel proxy handles streaming.
 * Streams `data: {json}\n\n` chunks; `[DONE]` terminates.
 */
export const lmstudioService: AIService = {
  provider: 'lmstudio',
  suggestedModels: [], // user types whatever LM Studio has loaded

  async streamChat(params: StreamChatParams, handlers: StreamChatHandlers): Promise<void> {
    const baseUrl = params.baseUrl ?? getEffectiveBaseUrl('lmstudio');
    const url = params.useProxy ? '/api/lmstudio' : baseUrl;
    const messages = params.system
      ? [{ role: 'system', content: params.system }, ...params.messages]
      : params.messages;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          params.useProxy
            ? { baseUrl, model: params.model, messages }
            : { model: params.model, messages, stream: true },
        ),
        signal: params.signal,
      });
    } catch (err) {
      handlers.onError(err instanceof Error ? err : new Error(String(err)));
      return;
    }

    if (!response.ok || !response.body) {
      handlers.onError(new Error(`LM Studio request failed: HTTP ${response.status}`));
      return;
    }

    await consumeOpenAiSse(response.body, handlers);
  },

  async testConnection(baseUrl?: string, signal?: AbortSignal): Promise<boolean> {
    const url = (baseUrl ?? getEffectiveBaseUrl('lmstudio')).replace(/\/$/, '') + '/models';
    try {
      const r = await fetch(url, { method: 'GET', signal });
      return r.ok;
    } catch {
      return false;
    }
  },
};

async function consumeOpenAiSse(
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
        if (data === '[DONE]') {
          handlers.onDone(full);
          return;
        }
        if (!data) continue;
        try {
          const json = JSON.parse(data);
          const delta: string | undefined = json.choices?.[0]?.delta?.content;
          if (delta) {
            full += delta;
            handlers.onDelta(delta);
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
