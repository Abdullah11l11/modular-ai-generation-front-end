/**
 * Parsers for layer-task AI responses.
 *
 * The modals each tell the AI to emit a single fenced code block with
 * a language tag matching the file extension. The parser anchors on
 * that tag (e.g. ` ```css ` for `style.css`) and falls back to the
 * first fenced block of any language. For multi-slide structure
 * outputs the AI emits N ` ```html ` blocks separated by
 * `<!-- slide-NN -->` markers.
 */

const FENCE_RE = /(?:^|\n)```(\w+)?\n([\s\S]*?)\n```/g;

export function parseFencedBlock(
  raw: string,
  expectedLang?: string,
): string | null {
  const matches = [...raw.matchAll(FENCE_RE)];
  if (matches.length === 0) return null;
  if (expectedLang) {
    const anchored = matches.find((m) => (m[1] ?? '').toLowerCase() === expectedLang);
    if (anchored) return anchored[2].trim();
  }
  return matches[0][2].trim();
}

export function parseJsonBlock(raw: string): { ok: true; value: unknown } | { ok: false; error: string } {
  const text = parseFencedBlock(raw, 'json');
  if (text == null) return { ok: false, error: 'No JSON code block found.' };
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Split a structure-task reply into multiple slide blocks.
 * Returns an array of trimmed HTML strings — one per new/modified slide.
 */
export function parseHtmlBlocks(raw: string): string[] {
  // First, split on the multi-slide marker if present.
  const parts = raw.split(/<!--\s*slide-[a-z0-9-]+\s*-->/i);
  const out: string[] = [];
  for (const part of parts) {
    const matches = [...part.matchAll(FENCE_RE)];
    for (const m of matches) {
      const lang = (m[1] ?? '').toLowerCase();
      if (lang === 'html') {
        out.push(m[2].trim());
      } else if (!lang) {
        // untagged fenced block inside a structure reply — treat as html
        out.push(m[2].trim());
      }
    }
  }
  return out;
}
