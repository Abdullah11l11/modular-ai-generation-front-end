/**
 * Hidden-iframe DOM rasterizer.
 *
 * Drives `modern-screenshot` against a detached same-origin
 * `<iframe srcdoc>` sized at the slide's natural dimensions.
 *
 * Why an iframe (rather than passing the assembled HTML to
 * modern-screenshot directly)?
 *
 * - `.mgf-slide { min-height: 70vh }` (`baseCss.ts:129`) and the
 *   `clamp(..., Nvw, ...)` typography in the same file resolve
 *   against the *rendering* viewport, not the host window's. A
 *   scoped iframe with viewport-sized pixels (1280×720 etc.) gives
 *   us a stable, host-independent layout reference. Resizing the
 *   iframe for higher resolution would re-layout — typography and
 *   padding would scale — so we use modern-screenshot's `scale`
 *   option instead, which only enlarges the captured canvas backing
 *   store.
 * - The KaTeX renderer waits for `window.katex` inside the iframe,
 *   which is exactly what we need to gate capture on; using the host
 *   window's `window.katex` would race with both the CDN load and
 *   the script execution order inside the document.
 *
 * The output is a `data:image/png` (or `data:image/jpeg`) string
 * suitable for passing straight to `jspdf.addImage` or to
 * `downloadBytes` for image exports.
 */

import { domToJpeg, domToPng } from 'modern-screenshot';

export type RasterizeFormat = 'png' | 'jpeg';

export type RasterizeOptions = {
  /** Already-assembled HTML for the slide/document. Should be the output of
   *  `assemblePreviewHtml({ ..., interactive: false })` so the click handler
   *  is omitted. */
  html: string;
  /** Natural pixel width of the slide (e.g. 1280). */
  width: number;
  /** Natural pixel height of the slide (e.g. 720). For scrollable types
   *  this should be the document's full scroll height. */
  height: number;
  /** Resolution multiplier. 2 ≈ 2× HiDPI, 3 = print-res. Default 2. */
  scale?: number;
  /** Image format. Default `png`. */
  format?: RasterizeFormat;
  /** JPEG quality 0..1. Ignored for PNG. Default 0.92. */
  quality?: number;
  /** Body background; used when transparent areas would otherwise be
   *  captured as white. Default `#050505` to match `baseCss.ts`. */
  backgroundColor?: string;
  /** Maximum time to wait for fonts + images + math + capture. Default 15s
   *  for fixed-size slides, 60s for `fitContent` (scrollable) since SVG
   *  foreignObject rasterization of a multi-thousand-pixel-tall document
   *  is significantly slower than a 720p slide. */
  timeoutMs?: number;
  /** Optional AbortSignal so callers can cancel a long export. */
  signal?: AbortSignal;
  /** When true, resize the iframe after load to the body's actual
   *  `scrollHeight`. Required for scrollable types whose assembled
   *  document height is not known up front (multi-section websites
   *  with concatenated slide-N.html files). Default false. */
  fitContent?: boolean;
};

export type RasterizeResult = {
  dataUrl: string;
  /** Post-scale pixel width as reported by modern-screenshot. */
  width: number;
  /** Post-scale pixel height. */
  height: number;
  /** Pre-scale natural width. Equals the iframe width except when
   *  `fitContent: true` resized to the document's scroll height. */
  naturalWidth: number;
  /** Pre-scale natural height. Equals the iframe height except when
   *  `fitContent: true` resized to the document's scroll height. */
  naturalHeight: number;
  /** Decoded byte length of the payload (after the `data:` prefix is
   *  stripped). Useful for progress reporting and unit sanity checks. */
  bytes: number;
};

/**
 * Race a promise against an ms timeout + an optional AbortSignal.
 * Keeps the waitForReady path tidy.
 */
function withDeadline<T>(promise: Promise<T>, timeoutMs: number, signal?: AbortSignal): Promise<T> {
  if (signal?.aborted) return Promise.reject(new Error('aborted'));
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onAbort: (() => void) | undefined;
  return new Promise<T>((resolve, reject) => {
    const timeout = new Promise<never>((_, rej) => {
      timer = setTimeout(
        () => rej(new Error(`rasterize timed out after ${timeoutMs}ms`)),
        timeoutMs,
      );
    });
    if (signal) {
      onAbort = () => {
        if (timer) clearTimeout(timer);
        reject(new Error('aborted'));
      };
      signal.addEventListener('abort', onAbort);
    }
    Promise.race([promise, timeout])
      .then((v) => {
        if (timer) clearTimeout(timer);
        if (signal && onAbort) signal.removeEventListener('abort', onAbort);
        resolve(v);
      })
      .catch((err) => {
        if (timer) clearTimeout(timer);
        if (signal && onAbort) signal.removeEventListener('abort', onAbort);
        reject(err);
      });
  });
}

/**
 * Wait for fonts, images and KaTeX to be ready inside the iframe.
 * Resolves when capture can safely proceed.
 */
async function waitForIframeReady(doc: Document, win: Window, timeoutMs: number): Promise<void> {
  // 1. Web fonts (Cairo, Noto Naskh, etc). `fonts.ready` resolves when
  //    the FaceSet for the document is fully loaded; if `fonts` API is
  //    unavailable (older browsers), this just resolves immediately.
  const fontsReady =
    'fonts' in doc ? (doc as Document & { fonts: { ready: Promise<unknown> } }).fonts.ready : Promise.resolve();
  await withDeadline(Promise.resolve(fontsReady), timeoutMs);

  // 2. Images. Even when no `<img>` tags are present, the array is
  //    empty and the promise resolves synchronously — no extra guard
  //    needed.
  const images = Array.from(doc.images);
  await Promise.all(
    images.map((img) =>
      img.complete && img.naturalWidth > 0
        ? null
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          }),
    ),
  );

  // 3. KaTeX. The render script polls `window.katex.render`. If the
  //    document has `mgf-math-enabled`, wait until the function is
  //    available, then an extra beat for the inline math content to
  //    actually render.
  if (doc.body.classList.contains('mgf-math-enabled')) {
    await withDeadline(
      new Promise<void>((resolve) => {
        const start = Date.now();
        const tick = () => {
          const katex = (win as unknown as { katex?: { render?: unknown } }).katex;
          if (katex && typeof katex.render === 'function') {
            // Give one more tick so render() output lands.
            setTimeout(resolve, 50);
            return;
          }
          if (Date.now() - start > timeoutMs) {
            resolve();
            return;
          }
          setTimeout(tick, 50);
        };
        tick();
      }),
      timeoutMs,
    );
  }
}

/**
 * Attach a hidden offscreen iframe sized at the natural slide
 * dimensions, load the assembled HTML, return its document + a
 * teardown function. We always serve at natural size — never at
 * `width × scale` — because CSS `vh`/`vw` units in BASE_CSS would
 * relayout otherwise.
 */
function buildHiddenIframe(width: number, height: number): {
  iframe: HTMLIFrameElement;
  teardown: () => void;
} {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');
  iframe.style.cssText = `
    position: fixed;
    top: 0;
    left: -99999px;
    width: ${width}px;
    height: ${height}px;
    border: 0;
    visibility: hidden;
    pointer-events: none;
  `;
  document.body.appendChild(iframe);
  return { iframe, teardown: () => iframe.remove() };
}

/**
 * Push the assembled HTML into the iframe and resolve when it is
 * usable. We use the `load` event instead of polling `complete`, then
 * also wait a microtask for the parser to have actually parsed the
 * document element (older Chromium could have a race).
 */
function loadIntoIframe(
  iframe: HTMLIFrameElement,
  html: string,
): Promise<{ doc: Document; win: Window }> {
  return new Promise((resolve, reject) => {
    iframe.addEventListener('load', () => {
      try {
        const doc = iframe.contentDocument;
        const win = iframe.contentWindow;
        if (!doc || !win) {
          reject(new Error('iframe produced no document'));
          return;
        }
        if (!doc.documentElement) {
          // Some browsers fire `load` before the HTML is fully parsed.
          // Queue to the next macrotask and retry.
          setTimeout(() => resolve({ doc, win }), 0);
        } else {
          resolve({ doc, win });
        }
      } catch (err) {
        reject(err);
      }
    });
    iframe.srcdoc = html;
  });
}

const DEFAULT_BG = '#050505';

/**
 * Render the assembled HTML into a rasterized image.
 */
export async function rasterizeHtml(opts: RasterizeOptions): Promise<RasterizeResult> {
  const {
    html,
    width,
    height,
    scale = 2,
    format = 'png',
    quality = 0.92,
    backgroundColor = DEFAULT_BG,
    signal,
    fitContent = false,
  } = opts;
  // Bump the timeout for tall scrollable documents — SVG foreignObject
  // rasterization of multi-thousand-pixel-tall content is significantly
  // slower than a single 720p slide.
  const timeoutMs = opts.timeoutMs ?? (fitContent ? 60000 : 15000);

  if (!html) throw new Error('rasterizeHtml: html is empty');
  if (width <= 0 || height <= 0) throw new Error('rasterizeHtml: width/height must be positive');
  if (scale < 1 || scale > 4) throw new Error('rasterizeHtml: scale must be between 1 and 4');

  const { iframe, teardown } = buildHiddenIframe(width, height);

  try {
    const { doc, win } = await withDeadline(loadIntoIframe(iframe, html), timeoutMs, signal);

    await withDeadline(waitForIframeReady(doc, win, timeoutMs), timeoutMs, signal);

    // Scrollable: re-size the iframe to the actual document height
    // after fonts/images have settled. Without this, the iframe stays
    // at the deck's natural height (e.g. 720) and the document
    // overflows, so modern-screenshot would only capture the visible
    // region — not the full website. We must re-run `fonts.ready`
    // because changing layout can trigger re-layouts that re-fetch
    // web fonts.
    let captureWidth = width;
    let captureHeight = height;
    if (fitContent) {
      const scrollH = Math.max(
        doc.body.scrollHeight,
        doc.documentElement.scrollHeight,
      );
      if (scrollH > 0 && scrollH !== height) {
        iframe.style.height = `${scrollH}px`;
        captureHeight = scrollH;
        await withDeadline(
          Promise.resolve(
            (doc as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready ?? null,
          ),
          timeoutMs,
        );
      }
    }

    // modern-screenshot operates on a Node. We capture the document
    // body so it gets the natural height of the scrollable content.
    const target = doc.body;

    const dataUrl = await withDeadline(
      format === 'jpeg'
        ? domToJpeg(target, {
            width: captureWidth,
            height: captureHeight,
            scale,
            backgroundColor,
            quality,
            type: 'image/jpeg',
          })
        : domToPng(target, {
            width: captureWidth,
            height: captureHeight,
            scale,
            backgroundColor,
            type: 'image/png',
          }),
      timeoutMs,
      signal,
    );

    // modern-screenshot returns `data:image/png;base64,…` with no
    // `width`/`height` in the API, but the captured pixel dimensions
    // are `width*scale` × `height*scale`. Compute the payload length
    // after the comma so callers can sanity-check the result.
    const comma = dataUrl.indexOf(',');
    const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : '';
    // base64 expands bytes by ~4/3.
    const bytes = base64 ? Math.floor((base64.length * 3) / 4) : 0;

    return {
      dataUrl,
      width: Math.round(captureWidth * scale),
      height: Math.round(captureHeight * scale),
      // Pre-scale dimensions — useful for callers that want the
      // natural pixel size (e.g. PDF page sizing) without re-dividing.
      naturalWidth: captureWidth,
      naturalHeight: captureHeight,
      bytes,
    };
  } finally {
    teardown();
  }
}
