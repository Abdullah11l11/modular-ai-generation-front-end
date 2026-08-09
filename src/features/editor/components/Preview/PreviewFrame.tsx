import { useRef, useEffect, useCallback } from 'react';

type PreviewFrameProps = {
  srcDoc: string;
  onElementClick?: (selector: string) => void;
};

export function PreviewFrame({ srcDoc, onElementClick }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleMessage = useCallback(
    (e: MessageEvent) => {
      if (e.data?.type === 'element-click' && onElementClick) {
        onElementClick(e.data.selector);
      }
    },
    [onElementClick],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  return (
    <div className="aspect-[16/10] w-full overflow-hidden rounded-lg border border-(--bor2) bg-white shadow-sm">
      <iframe
        ref={iframeRef}
        title="Preview"
        srcDoc={srcDoc}
        sandbox="allow-same-origin"
        className="size-full"
      />
    </div>
  );
}
