import type { FileLayer } from '@/types/api';

type EditorStatusBarProps = {
  slideIndex: number;
  totalSlides: number;
  selectedElement: string | null;
  activeLayers: FileLayer[];
};

export function EditorStatusBar({ slideIndex, totalSlides, selectedElement, activeLayers }: EditorStatusBarProps) {
  return (
    <div className="flex h-7 items-center gap-4 border-t border-(--bor2) px-(--space-page-x) text-xs text-(--t3)">
      <span>
        Slide {slideIndex} of {totalSlides}
      </span>

      {selectedElement && (
        <span className="text-(--cy)">{selectedElement}</span>
      )}

      {activeLayers.length > 0 && (
        <div className="ml-auto flex items-center gap-2">
          {activeLayers.map((layer) => (
            <span
              key={layer}
              className="rounded-xs bg-(--sur) px-1.5 py-0.5 text-xs text-(--t2)"
            >
              {layer}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
