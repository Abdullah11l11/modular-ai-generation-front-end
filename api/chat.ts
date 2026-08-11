import type { VercelRequest, VercelResponse } from '@vercel/node';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

type Body = {
  apiKey: string;
  baseUrl: string;
  model: string;
  system: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
};

const validateBody = (body: Partial<Body> | undefined): body is Body => {
  if (!body || typeof body !== 'object') return false;
  if (typeof body.apiKey !== 'string' || !body.apiKey) return false;
  if (typeof body.baseUrl !== 'string' || !body.baseUrl) return false;
  if (typeof body.model !== 'string' || !body.model) return false;
  if (typeof body.system !== 'string') return false;
  if (!Array.isArray(body.messages) || body.messages.length === 0) return false;
  return true;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!validateBody(req.body as Partial<Body>)) {
    return res
      .status(400)
      .json({ error: 'apiKey, baseUrl, model, system, and non-empty messages are required' });
  }
  const body = req.body as Body;

  let upstream: Response;
  try {
    upstream = await fetch(`${body.baseUrl.replace(/\/$/, '')}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': body.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: body.model,
        system: body.system,
        messages: body.messages,
        max_tokens: 4096,
        stream: true,
      }),
    });
  } catch {
    return res.status(502).json({ error: 'Upstream unreachable' });
  }

  if (!upstream.ok || !upstream.body) {
    return res.status(upstream.status).json({ error: `Upstream error: ${upstream.status}` });
  }

  for (const [k, v] of Object.entries(CORS_HEADERS)) res.setHeader(k, v);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');

  const reader = upstream.body.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
    res.end();
  }
}
