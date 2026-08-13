/**
 * Class-vocabulary helpers for layer-task AI modals.
 *
 * The Structure modal lets the AI emit `<mgf-slide>…</mgf-slide>` HTML.
 * When the AI invents `mgf-*` classes that don't exist in the project's
 * `layout.css`, the rendered slide looks "messy" — the elements show
 * up but with no styling.
 *
 * These helpers let the modal:
 *   1. Pull the set of `mgf-*` classes actually defined in the project's
 *      `layout.css` (or, when missing, fall back to the canonical
 *      vocabulary in `standards/classes.md`).
 *   2. Pull the set of `mgf-*` classes actually USED in the AI's
 *      generated HTML.
 *   3. Diff the two so the modal can warn about invented classes before
 *      the user hits Apply.
 *
 * Everything is regex-based — no CSS parser dependency, no AST. The
 * matchers are deliberately conservative (we want false-negatives for
 * invented classes, not false-positives that hide real problems).
 */

/**
 * Extract the class names defined in a CSS source string.
 *
 * Matches `.classname` selectors — multi-class chains like
 * `.a.b.c` yield all three tokens. Pseudo-classes (`.a:hover`) yield
 * the base name only (`a`), so `.a:hover` won't be reported as `a:hover`.
 *
 * Non-mgf tokens are returned too so the caller can decide whether to
 * ignore them (the modals currently only care about `mgf-*`).
 */
export function extractDefinedClassesFromCss(cssText: string): Set<string> {
  const out = new Set<string>();
  if (!cssText) return out;

  // Strip /* … */ comments first so commented-out selectors don't
  // count as defined.
  const stripped = cssText.replace(/\/\*[\s\S]*?\*\//g, '');

  // Find every `.identifier` run, then break it on dots / whitespace /
  // combinators to handle `.foo.bar`, `.foo:hover`, `.foo > .bar`.
  // We do NOT match `.foo:hover` as `foo:hover` — the regex stops at
  // `:` because we exclude pseudo-class chars below.
  const selectorRe = /\.(-?[_A-Za-z][\w-]*)/g;
  let m: RegExpExecArray | null;
  while ((m = selectorRe.exec(stripped)) !== null) {
    // Reject pseudo-elements like `::before` (the leading `-` keeps
    // them out already, but double-check).
    const name = m[1];
    if (!name) continue;
    out.add(name);
  }
  return out;
}

/**
 * Extract every `mgf-*` class token used in an HTML string.
 *
 * Handles double- and single-quoted `class="…"` attributes. Non-mgf
 * tokens are ignored — the modals only care about the framework's
 * own vocabulary, not Bootstrap/Tailwind/etc.
 *
 * Returns a stable order: sorted alphabetically so the modal can
 * present a consistent list even when the model emits tokens in a
 * different order each run.
 */
export function extractUsedClassesFromHtml(htmlText: string): Set<string> {
  const out = new Set<string>();
  if (!htmlText) return out;

  const attrRe = /\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(htmlText)) !== null) {
    const value = m[1] ?? m[2] ?? '';
    for (const tok of value.split(/\s+/)) {
      if (!tok) continue;
      if (tok.startsWith('mgf-')) out.add(tok);
    }
  }
  return out;
}

/**
 * Extract canonical `mgf-*` class names from the Markdown vocabulary
 * file (`standards/classes.md`). Used as the fallback when the
 * project's own `layout.css` is empty — the AI is told to draw from
 * this file when nothing project-specific is available.
 *
 * Matches backtick-wrapped identifiers in tables / inline code:
 *   | `mgf-grid-2` | ... |
 *   `mgf-card`
 */
export function extractDefinedClassesFromMarkdown(mdText: string): Set<string> {
  const out = new Set<string>();
  if (!mdText) return out;
  const re = /`((?:mgf-)[A-Za-z][\w-]*|[A-Za-z][\w-]*(?:-[A-Za-z0-9]+)+)`/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(mdText)) !== null) {
    out.add(m[1]);
  }
  return out;
}

/**
 * Split `used` into known + unknown relative to `defined`.
 * Returns alphabetically-sorted arrays so the UI shows a stable order.
 */
export function diffClasses(
  defined: Iterable<string>,
  used: Iterable<string>,
): { known: string[]; unknown: string[] } {
  const def = new Set(defined);
  const known: string[] = [];
  const unknown: string[] = [];
  for (const cls of used) {
    if (def.has(cls)) known.push(cls);
    else unknown.push(cls);
  }
  known.sort();
  unknown.sort();
  return { known, unknown };
}

/**
 * Pick the best available vocabulary for a project.
 *
 * Prefers the project's own `layout.css` (so the user sees what their
 * project actually defines). Falls back to the canonical classes.md
 * vocabulary when layout.css is empty / missing / has no classes.
 *
 * Returns `{ source, defined }` so the modal can label which source
 * it used ("project layout.css" vs "canonical fallback").
 */
export function resolveVocabulary(
  layoutCss: string,
  canonicalClassesMd: string,
): { source: 'project' | 'fallback'; defined: Set<string> } {
  const fromProject = extractDefinedClassesFromCss(layoutCss);
  if (fromProject.size > 0) {
    return { source: 'project', defined: fromProject };
  }
  const fromCanonical = extractDefinedClassesFromMarkdown(canonicalClassesMd);
  return { source: 'fallback', defined: fromCanonical };
}