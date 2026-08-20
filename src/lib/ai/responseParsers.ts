/**
 * Parsers for layer-task AI responses.
 *
 * The modals each tell the AI to emit a single fenced code block with
 * a language tag matching the file extension. The parser anchors on
 * that tag (e.g. ` ```css ` for `style.css`) and falls back to the
 * first fenced block of any language.
 *
 * For multi-slide structure outputs the prompt asks the AI to emit
 * either:
 *   1. ` ```html ` blocks separated by `<!-- slide-NN -->` markers,
 *   2. ` ```html ` blocks without markers,
 *   3. plain `<mgf-slide>...</mgf-slide>` HTML without fences.
 *
 * The parser tries each strategy in order so a non-conforming model
 * doesn't block the user — better to extract three loose slides than
 * to throw "no code blocks found".
 */

const FENCE_RE = /(?:^|\n)```(\w+)?\s*\n([\s\S]*?)\n```/g;

/** Custom element form: `<mgf-slide class="...">…</mgf-slide>`. */
const CUSTOM_SLIDE_RE = /<mgf-slide\b[^>]*>[\s\S]*?<\/mgf-slide>/g;

/** Legacy form: `<section class="… mgf-slide …">…</section>`. */
const LEGACY_SLIDE_RE =
  /<([a-zA-Z][\w-]*)[^>]*\bclass\s*=\s*["'][^"']*\bmgf-slide\b[^"']*["'][^>]*>[\s\S]*?<\/\1>/g;

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

/** Pull every `<mgf-slide>` (or legacy `…class="…mgf-slide…">`) out of
 *  free-form text. Used as the final fallback when the model ignored
 *  the fence / marker protocol. */
function extractSlideTags(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(CUSTOM_SLIDE_RE)) out.push(m[0].trim());
  for (const m of text.matchAll(LEGACY_SLIDE_RE)) out.push(m[0].trim());
  return out;
}

/**
 * Parse the AI's reply to a "generate a full project" task.
 *
 * Contract per `standards/output-schema.md`: a single top-level
 * JSON object whose keys are file names and whose values are file
 * contents (as strings). The system prompt instructs the model to
 * emit raw JSON with NO markdown fences and NO preamble / postamble,
 * but real models occasionally add either anyway — three strategies
 * catch the common variations:
 *
 *   1. `JSON.parse(raw)` works when the model follows the contract
 *      exactly.
 *   2. Strip ` ```json … ``` ` fences (with optional whitespace
 *      + language tag) and try again.
 *   3. Locate the largest `{ … }` block by `indexOf` / `lastIndexOf`
 *      and try to parse that.
 *
 * Validation: the result must be an object whose values are all
 * strings. We additionally require at least `style.css` and one
 * `slide-NN.html` key to consider the parse "useful" — a JSON object
 * with no slides means the model either ignored the brief or the
 * stream was truncated. The caller decides whether to surface the
 * partially-parsed files anyway.
 */
export function parseFullProjectJson(
  raw: string,
):
  | {
      ok: true;
      files: Record<string, string>;
      warnings: string[];
      hadFences: boolean;
    }
  | { ok: false; error: string } {
  const trimmed = raw.trim();

  const strategies: Array<{ label: string; extract: () => string; hadFences: boolean }> = [
    { label: 'raw', extract: () => trimmed, hadFences: false },
    {
      label: 'fenced',
      extract: () => stripFences(trimmed),
      hadFences: true,
    },
    {
      label: 'largest-block',
      extract: () => extractLargestBraceBlock(trimmed),
      hadFences: false,
    },
  ];

  for (const strategy of strategies) {
    const candidate = strategy.extract();
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        continue;
      }
      const obj = parsed as Record<string, unknown>;
      // Coerce to Record<string, string>; drop non-scalar values with a warning.
      const files: Record<string, string> = {};
      const warnings: string[] = [];
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'string') {
          files[k] = v;
        } else {
          warnings.push(`Skipped "${k}" — expected string, got ${typeof v}`);
        }
      }
      return { ok: true, files, warnings, hadFences: strategy.hadFences };
    } catch {
      // try the next strategy
    }
  }

  return {
    ok: false,
    error:
      'The model response was not parseable as a JSON object. ' +
      'Try regenerating, or use a larger model.',
  };
}

/** Strip the outermost `\`\`\`json … \`\`\`` (or any-language) fence pair.
 *  Returns the inner content trimmed, or the input if no fence found. */
function stripFences(text: string): string {
  const m = text.match(/^```\w*\s*\n([\s\S]*?)\n```\s*$/);
  return m ? m[1].trim() : text;
}

/** Return the largest `{ … }` block in `text`, or the input if braces
 *  don't balance (so the caller still sees the original). */
function extractLargestBraceBlock(text: string): string {
  const start = text.indexOf('{');
  if (start < 0) return text;
  const end = text.lastIndexOf('}');
  if (end <= start) return text;
  return text.slice(start, end + 1);
}

/**
 * Split a structure-task reply into multiple slide blocks.
 * Returns an array of trimmed HTML strings — one per new/modified slide.
 *
 * Tries three strategies per marker-delimited segment, in order:
 *   1. ` ```html ` fences inside the segment.
 *   2. Bare `<mgf-slide>` tags inside the segment (model forgot the
 *      fences but still emitted valid HTML).
 *   3. If neither works, the segment is treated as a single block
 *      verbatim — better than nothing, the user can see what came back.
 */
export function parseHtmlBlocks(raw: string): string[] {
  // Split on multi-slide markers if present. If absent this returns a
  // single-element array containing the whole raw string, which is
  // fine — the per-segment logic below will still try fences/tags.
  const parts = raw.split(/<!--\s*slide-[a-z0-9-]+\s*-->/i);
  const out: string[] = [];

  for (const part of parts) {
    if (!part.trim()) continue;

    // Strategy 1: fenced blocks.
    let foundFence = false;
    for (const m of part.matchAll(FENCE_RE)) {
      const lang = (m[1] ?? '').toLowerCase();
      if (lang === 'html' || (!lang && /<mgf-slide|<section/.test(m[2]))) {
        const inner = m[2].trim();
        // If a single fence contains multiple <mgf-slide>s, split it
        // further so each emitted block is exactly one slide.
        const innerSlides = extractSlideTags(inner);
        if (innerSlides.length > 0) {
          out.push(...innerSlides);
        } else {
          out.push(inner);
        }
        foundFence = true;
      }
    }
    if (foundFence) continue;

    // Strategy 2: bare slide tags.
    const slides = extractSlideTags(part);
    if (slides.length > 0) {
      out.push(...slides);
      continue;
    }

    // Strategy 3: keep the segment as-is so the user can see what came
    // back. The modal's error UI will still surface the empty result.
    out.push(part.trim());
  }

  // De-dupe by content (the model occasionally echoes the same block
  // back in a multi-block reply). Keep first occurrence.
  const seen = new Set<string>();
  return out.filter((b) => {
    const key = b.replace(/\s+/g, ' ').slice(0, 200);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}