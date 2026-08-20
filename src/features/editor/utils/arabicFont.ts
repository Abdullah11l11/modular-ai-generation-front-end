/**
 * Arabic font fallback for RTL projects.
 *
 * `BASE_CSS` in `useAssemblePreview.ts` sets `font-family: var(--mgf-font-body,
 * system-ui, sans-serif)`. System sans on Windows / macOS renders Arabic
 * adequately but pairing-specific Latin (any purely Latin word embedded in
 * otherwise-Arabic text) ends up with a visibly different font from the
 * surrounding script. Cairo + Noto Naskh Arabic give us a consistent
 * Euro-Arabic pairing that fits the editor's dark / light themes.
 *
 * The fonts are loaded from Google Fonts CDN. Google CDN is the cheapest
 * path to a coherent Arabic + Latin pairing without bundling ~400KB of
 * woff2 files into the editor. The `<link>` tags are emitted only when the
 * project is RTL (the rendered preview caches the assembled HTML anyway,
 * so the cost is paid once per project load). They sit in the document
 * head *before* the body's CSS so the font-family fallback resolves on
 * first paint.
 *
 * `ARABIC_FONT_STACK` is structured so that even when Cairo / Noto Naskh
 * are still loading (or blocked), the browser falls back to the system
 * Arabic-appropriate font (`Tahoma`, `Geeza Pro`, `Segoe UI`) — those
 * ship on every Windows / macOS install and can render Arabic without
 * missing-glyph boxes.
 */

export const ARABIC_FONT_LINKS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
`;

export const ARABIC_FONT_STACK = [
  '"Cairo"',
  '"Noto Naskh Arabic"',
  'Tahoma',
  'Geeza Pro',
  '"Segoe UI"',
  'system-ui',
  'sans-serif',
].join(', ');
