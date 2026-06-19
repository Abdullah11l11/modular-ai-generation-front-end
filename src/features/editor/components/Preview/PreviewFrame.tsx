import { useRef, useCallback, useEffect } from 'react';

type PreviewFrameProps = {
  html: string;
  onElementClick?: (selector: string) => void;
};

function buildSelector(el: Element): string {
  let selector = el.tagName.toLowerCase();
  if (el.id) selector += `#${el.id}`;
  const classes = typeof el.className === 'string' && el.className.trim()
    ? el.className.trim().split(/\s+/).filter(Boolean).map((c) => `.${c}`).join('')
    : '';
  selector += classes;
  return selector;
}

export function PreviewFrame({ html, onElementClick }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const attachListeners = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !onElementClick) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    function handleClick(e: MouseEvent) {
      const target = e.target as Element;
      if (
        !target ||
        target === doc!.body ||
        target === doc!.documentElement
      ) return;

      const selector = buildSelector(target);
      onElementClick!(selector);
    }

    doc.addEventListener('click', handleClick, true);
    cleanupRef.current = () => doc.removeEventListener('click', handleClick, true);
  }, [onElementClick]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      onLoad={attachListeners}
      sandbox="allow-same-origin"
      className="h-full w-full rounded-md border border-(--bor2) bg-white"
      title="Slide preview"
    />
  );
}
