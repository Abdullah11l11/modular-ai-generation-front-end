/**
 * Utilities for working with `data-field="<key>"` elements inside slide
 * HTML. The convention is documented in `src/lib/ai/prompts/SYSTEM_BASE.ts`:
 * each component declares its data schema via `data-field` attributes, and
 * the renderer injects content into them.
 *
 * The Content tab uses these utilities to surface every editable field as
 * a labelled input — one per unique key — instead of forcing the user to
 * edit raw HTML. Edits update the original HTML element's text content so
 * the live preview reflects the change immediately.
 */

export type DataField = {
  /** The `data-field` attribute value, used as the input label. */
  key: string;
  /** Current text content of the first matching element. */
  value: string;
  /**
   * Tag of the first matching element (`h2`, `p`, `a`, …). Used to
   * decide whether the input should be a textarea (long body) vs a
   * single-line input.
   */
  tagName: string;
};

/**
 * Parse `html` and return one entry per *unique* `data-field` key. When
 * the same key appears more than once (e.g. cards), the first occurrence
 * wins for the displayed value; updates apply to every match.
 *
 * `DOMParser` is browser-only; this module is only invoked from React
 * render code, which always runs in the browser.
 */
export function extractDataFields(html: string): DataField[] {
  // Note: deliberately do NOT trim `html` here — whitespace-only bodies are
  // still valid input and worth parsing in case the user is about to type
  // their first character.
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const elements = doc.querySelectorAll('[data-field]');
  const seen = new Set<string>();
  const fields: DataField[] = [];
  for (const el of Array.from(elements)) {
    const key = el.getAttribute('data-field');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    fields.push({
      key,
      // Note: deliberately do NOT trim textContent here. The previous `.trim()`
      // silently ate trailing spaces the user typed, so "Hello " became "Hello"
      // after every re-extract. updateDataField already round-trips via
      // textContent assignment which preserves whitespace exactly, so we let
      // it through verbatim.
      value: el.textContent ?? '',
      tagName: el.tagName.toLowerCase(),
    });
  }
  return fields;
}

/**
 * Update the text content of every element inside `html` whose
 * `data-field` attribute equals `key`. Returns the new HTML body.
 *
 * The element's other attributes (class, href, data-label-field, …) and
 * any nested non-text children are preserved.
 */
export function updateDataField(html: string, key: string, value: string): string {
  if (!html.trim()) return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const safeKey = escapeCssAttr(key);
  const elements = doc.querySelectorAll(`[data-field="${safeKey}"]`);
  for (const el of Array.from(elements)) {
    el.textContent = value;
  }
  return doc.body.innerHTML;
}

/**
 * Prometheus / attribute-selector special-char escape. Lets the user
 * give a field a key like `card 0/label` without breaking the selector.
 */
function escapeCssAttr(value: string): string {
  return value.replace(/(["\\])/g, '\\$1');
}

/**
 * Tag names that read better as a multi-line textarea. Everything else
 * stays a single-line input (titles, labels, numbers, links…).
 */
const TEXTAREA_TAGS = new Set(['p', 'div', 'ul', 'ol', 'li', 'blockquote', 'pre']);

export function isLongTextField(tagName: string): boolean {
  return TEXTAREA_TAGS.has(tagName);
}

/**
 * Generate a human-readable label from a snake/camel key. The labels
 * are derived from the key so the user always sees something — even
 * when the project's class names don't give an obvious hint.
 */
export function labelForField(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
