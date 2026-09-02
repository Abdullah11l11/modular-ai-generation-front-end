import { useCallback, useEffect } from 'react';
import { ScaledIframe } from './ScaledIframe';

type PreviewFrameProps = {
  srcDoc: string;
  onElementClick?: (selector: string) => void;
  /** Override the natural width used for scale calculation (defaults to 1280). */
  naturalWidth?: number;
  /** Override the natural height used for scale calculation (defaults to 720). */
  naturalHeight?: number;
};

/**
 * Editor canvas preview. Renders the assembled slide HTML inside a
 * scaled iframe so the slide (1280×720 by default) always fits the
 * available canvas area without scroll. Click-to-select fires the
 * `element-click` postMessage from `useAssemblePreview`'s injected
 * handler.
 */
export function PreviewFrame({
  srcDoc,
  onElementClick,
  naturalWidth,
  naturalHeight,
}: PreviewFrameProps) {
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
    <ScaledIframe
      srcDoc={srcDoc}
      sandbox="allow-same-origin allow-scripts"
      title="Preview"
      naturalWidth={naturalWidth}
      naturalHeight={naturalHeight}
      className="rounded-lg border border-(--bor2) bg-white shadow-sm"
    />
  );
}