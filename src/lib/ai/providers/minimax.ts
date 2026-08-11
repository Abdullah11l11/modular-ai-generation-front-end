import type { AIService, StreamChatHandlers, StreamChatParams } from '../AIService';
import { getEffectiveBaseUrl } from '../baseUrl';
import { getKey } from '../apiKeys';

/**
 * MiniMax / Anthropic-compatible provider.
 * Sends POST {baseUrl}/v1/messages with `x-api-key: ${apiKey}` and `anthropic-version: 2023-06-01` headers.
 * Streams SSE events; only `content_block_delta` text deltas are surfaced.
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
    const baseUrl = (params.baseUrl ?? getEffectiveBaseUrl('minimax')).replace(/\/$/, '');
    const apiKey = getKey('minimax');
    if (!apiKey) {
      handlers.onError(new Error('No MiniMax API key set. Open the AI setup to add one.'));
      return;
    }

    const url = params.useProxy ? '/api/chat' : `${baseUrl}/v1/messages`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(params.useProxy ? {} : { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }),
        },
        body: JSON.stringify(
          params.useProxy
            ? {
                apiKey,
                baseUrl,
                model: params.model,
                system: params.system,
                messages: params.messages,
              }
            : {
                model: params.model,
                system: params.system,
                messages: params.messages,
                max_tokens: 4096,
                stream: true,
              },
        ),
        signal: params.signal,
      });
    } catch (err) {
      handlers.onError(err instanceof Error ? err : new Error(String(err)));
      return;
    }

    if (!response.ok || !response.body) {
      handlers.onError(new Error(`MiniMax request failed: HTTP ${response.status}`));
      return;
    }

    await consumeAnthropicSse(response.body, handlers);
  },

  async testConnection(baseUrl?: string, signal?: AbortSignal): Promise<boolean> {
    const url = (baseUrl ?? getEffectiveBaseUrl('minimax')).replace(/\/$/, '') + '/v1/models';
    try {
      const r = await fetch(url, { method: 'GET', signal });
      return r.ok;
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
