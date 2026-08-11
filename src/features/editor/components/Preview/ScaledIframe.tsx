import { useEffect, useRef, useState } from 'react';

/**
 * Default natural slide dimensions. MGF's `layout.css` defines
 * `.mgf-slide { width: 1280px; height: 720px }` (16:9) — that's what
 * the seeded projects render at, so it's our reference for the
 * scale-to-fit calculation.
 */
const DEFAULT_NATURAL_W = 1280;
const DEFAULT_NATURAL_H = 720;

type ScaledIframeProps = {
  srcDoc: string;
  /** Override the natural width used for scale calculation (defaults to 1280). */
  naturalWidth?: number;
  /** Override the natural height used for scale calculation (defaults to 720). */
  naturalHeight?: number;
  /** Sandboxing for the iframe. Defaults to allow-same-origin for click-to-select. */
  sandbox?: string;
  /** Extra classes for the outer wrapper. */
  className?: string;
  /** Iframe title for accessibility. */
  title?: string;
};

/**
 * Render an iframe at its natural slide dimensions (e.g. 1280×720)
 * and apply a CSS `transform: scale()` so it shrinks to fit whatever
 * container it's placed in — no scrollbars, no overflow.
 *
 * The wrapper keeps the slide's aspect ratio (`16/9` by default), so
 * the scaled iframe fills it without letterboxing. Uses a ResizeObserver
 * so the scale updates as the container resizes.
 */
export function ScaledIframe({
  srcDoc,
  naturalWidth = DEFAULT_NATURAL_W,
  naturalHeight = DEFAULT_NATURAL_H,
  sandbox = 'allow-same-origin',
  className,
  title = 'Preview',
}: ScaledIframeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const s = Math.min(width / naturalWidth, height / naturalHeight, 1);
      setScale(s);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [naturalWidth, naturalHeight]);

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full overflow-hidden ${className ?? ''}`}
      style={{ aspectRatio: `${naturalWidth} / ${naturalHeight}` }}
    >
      <iframe
        title={title}
        srcDoc={srcDoc}
        sandbox={sandbox}
        style={{
          width: `${naturalWidth}px`,
          height: `${naturalHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          border: '0',
        }}
      />
    </div>
  );
}