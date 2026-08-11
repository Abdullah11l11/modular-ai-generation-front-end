type ContentTabProps = {
  fileContent: string;
  fileId: string;
  onUpdate: (fileId: string, content: string) => void;
};

/**
 * The Content tab edits the slide HTML directly. The original
 * useCssProperties-driven panel assumed a CSS file with structured
 * `--title-text` style variables, which doesn't match either UVCP
 * (`data-field` placeholders) or MGF (`{{key}}` placeholders).
 *
 * A raw textarea is the lowest-friction way to make the tab work
 * regardless of which convention the project uses — changes flow into
 * the preview through the same optimistic cache update the other tabs
 * use.
 */
export function ContentTab({ fileContent, fileId, onUpdate }: ContentTabProps) {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-(--t2) uppercase tracking-wider">
          Slide HTML
        </span>
        <span className="text-[11px] text-(--t3)">
          {fileContent.length} chars
        </span>
      </div>
      <textarea
        value={fileContent}
        onChange={(e) => onUpdate(fileId, e.target.value)}
        spellCheck={false}
        className="min-h-[280px] w-full flex-1 resize-y rounded-md border border-(--bor2) bg-(--sur) p-2 font-mono text-[11px] leading-relaxed text-(--t1) outline-none focus:border-(--cy)"
      />
    </div>
  );
}
