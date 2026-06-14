import { useRef, useEffect, type RefObject } from 'react';

type PreviewFrameProps = {
  html: string;
  onElementClick?: (selector: string) => void;
  iframeRef: RefObject<HTMLIFrameElement | null>;
};

export function PreviewFrame({ html, onElementClick, iframeRef }: PreviewFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !onElementClick) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target !== iframe) {
        let selector = target.tagName.toLowerCase();
        if (target.id) {
          selector = `#${target.id}`;
        } else if (target.className && typeof target.className === 'string') {
          selector = target.className.split(' ').map((c) => `.${c}`).join('');
        }
        onElementClick(selector);
      }
    };

    const handleLoad = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          doc.addEventListener('click', handleClick);
        }
      } catch {
      }
    };

    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          doc.removeEventListener('click', handleClick);
        }
      } catch {
      }
    };
  }, [iframeRef, onElementClick]);

  return (
    <div ref={containerRef} className="flex aspect-video w-full max-w-4xl items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm" style={{ aspectRatio: '16/10' }}>
      <iframe
        ref={iframeRef}
        srcDoc={html}
        sandbox="allow-same-origin"
        title="Preview"
        className="h-full w-full"
      />
    </div>
  );
}
