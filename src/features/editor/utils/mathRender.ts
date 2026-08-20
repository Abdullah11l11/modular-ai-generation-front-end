/**
 * KaTeX math rendering layer.
 *
 * `mgf-math-root` is the scoped wrapper class. Inside it, two tags
 * mark math content:
 *
 *   <span class="math-inline" data-tex="E=mc^2"></span>
 *   <div  class="math-block"  data-tex="\frac{a}{b}"></div>
 *
 * `data-tex` carries the raw LaTeX. The render script below reads it,
 * hands it to KaTeX, and replaces the element's body with the
 * rendered HTML. KaTeX throws on bad LaTeX; the script catches and
 * falls back to plain text so a broken formula doesn't kill the rest
 * of the slide.
 *
 * KaTeX is a heavy library (~270KB CSS, ~120KB JS, ~4KB auto-render).
 * Instead of inlining the CSS/JS into every assembled HTML, we let
 * Vite bundle them once via `?url` imports and inject `<link>` /
 * `<script>` tags that load the bundled assets from the same origin.
 * The `srcdoc` iframe can fetch them without sandbox issues.
 *
 * Why scoped (`mgf-math-root`): KaTeX's own stylesheets target `.katex`
 * which is fine — there's no class conflict with `mgf-*`. The scope
 * wrapper exists so future overrides (theme-aware colors, e.g.) can
 * target `.mgf-math-root .katex { color: var(--mgf-color-text-primary) }`
 * without polluting non-math content.
 */

// Vite resolves these `?url` imports to the public asset URL of the
// bundled file. The CSS import gets processed by Vite (font URLs get
// rewritten to the /assets/* folder), and the JS imports stay as-is
// (KaTeX is a UMD script that exposes `window.katex`).
import katexCssUrl from 'katex/dist/katex.min.css?url';
import katexJsUrl from 'katex/dist/katex.min.js?url';

export const MATH_CSS_URL = katexCssUrl;
export const MATH_JS_URL = katexJsUrl;

/**
 * Head tags to inject into the iframe. Adds the KaTeX stylesheet +
 * scripts. The `defer` attribute ensures script execution happens in
 * document order after the DOM is parsed.
 */
export const MATH_HEAD_TAGS = `
<link rel="stylesheet" href="${MATH_CSS_URL}">
<script src="${MATH_JS_URL}" defer></script>
`;

/**
 * KaTeX tags loaded from a public CDN. Used by export pipelines
 * (standalone HTML download, rasterized PDF/PNG/JPG frames) where the
 * Vite-bundled `/assets/...` URLs won't resolve.
 *
 * Pinned to the same KaTeX version the project bundles locally so the
 * `MATH_RENDER_SCRIPT` behavior is identical. KaTeX's CSS references
 * its woff2 fonts by relative URL — jsDelivr serves them from the
 * same CDN path, so they resolve correctly.
 *
 * Trade-off: exported HTML needs network on first open. The CDNs are
 * the same ones the official docs link to and have multi-region PoPs,
 * so this is reliable for the vast majority of users. We accept this
 * rather than inlining ~1 MB of KaTeX + fonts into every export.
 */
export const KATEX_CDN_TAGS = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.css" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.js" crossorigin="anonymous"></script>
`;

/**
 * Render hook. Runs after `DOMContentLoaded`. For each `.math-inline`
 * / `.math-block` element, reads `data-tex` (or falls back to the
 * element's own text content) and hands it to KaTeX.
 *
 * `throwOnError: false` means a malformed LaTeX renders the source
 * text in red rather than throwing. This keeps partial breakage from
 * killing the whole slide.
 */
export const MATH_RENDER_SCRIPT = `
<script>
(function () {
  function render(el, displayMode) {
    var tex = el.getAttribute('data-tex');
    if (tex == null || tex === '') {
      tex = (el.textContent || '').trim();
    }
    if (!tex) return;
    try {
      window.katex.render(tex, el, {
        displayMode: displayMode,
        throwOnError: false,
        strict: 'ignore',
        output: 'html',
      });
      el.setAttribute('data-math-rendered', '1');
    } catch (e) {
      el.textContent = tex;
      el.setAttribute('data-math-error', String(e && e.message || e));
    }
  }
  function run() {
    // KaTeX is loaded as a UMD bundle that exposes an *object* on
    // window.katex with methods like render/ParseError — NOT a function.
    // An earlier draft checked typeof window.katex !== 'function',
    // which is always true (katex is always an object once loaded) and
    // made the poll loop spin forever. Gate on the render method instead.
    if (!window.katex || typeof window.katex.render !== 'function') {
      // KaTeX script has not loaded yet (rare with defer). Retry
      // shortly so a slow network does not leave the math unrendered.
      return setTimeout(run, 50);
    }
    var inlines = document.querySelectorAll('.mgf-math-root .math-inline');
    for (var i = 0; i < inlines.length; i++) render(inlines[i], false);
    var blocks = document.querySelectorAll('.mgf-math-root .math-block');
    for (var j = 0; j < blocks.length; j++) render(blocks[j], true);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
</script>
`;

/**
 * Detect whether the slide HTML has any math content. Used by the
 * assembler to decide whether to inject KaTeX assets (no need to add
 * 270KB of CSS for a slide with no formulas).
 */
export function hasMathContent(html: string): boolean {
  return /class="math-(inline|block)"/.test(html);
}

/**
 * Detect LaTeX delimiters in raw text. Useful for the AI layer that
 * wants to recognize user-written math even before they've wrapped it
 * in the right tags.
 */
export function detectLatexDelimiters(text: string): boolean {
  {
    return /\\\(|\\\[|\$\$.*\$\$|\$[^$]+\$/.test(text);
  }
}