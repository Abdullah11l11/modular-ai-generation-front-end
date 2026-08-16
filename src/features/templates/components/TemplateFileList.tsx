import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDownIcon, ChevronRightIcon, ExternalLinkIcon, FileTextIcon } from 'lucide-react';
import { TemplateFileViewer } from '@/features/templates/components/TemplateFileViewer';
import { formatBytes } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ProjectFile } from '@/types/api';

const LAYER_ORDER: ProjectFile['layer'][] = [
  'slide',
  'style',
  'layout',
  'content',
  'context',
  'rules',
  'meta',
  'asset',
];

const LAYER_LABEL: Record<ProjectFile['layer'], string> = {
  slide: 'Slide',
  style: 'Style',
  layout: 'Layout',
  content: 'Content',
  context: 'Context',
  rules: 'Rules',
  meta: 'Meta',
  asset: 'Asset',
};

const DEFAULT_EXPANDED: ProjectFile['layer'][] = ['slide', 'style', 'layout', 'content'];

type TemplateFileListProps = {
  files: ProjectFile[];
};

export function TemplateFileList({ files }: TemplateFileListProps) {
  const [expanded, setExpanded] = useState<Set<ProjectFile['layer']>>(new Set(DEFAULT_EXPANDED));
  const [openFile, setOpenFile] = useState<ProjectFile | null>(null);

  const grouped = LAYER_ORDER.map((layer) => ({
    layer,
    files: files
      .filter((f) => f.layer === layer)
      .sort((a, b) => a.sort_order - b.sort_order),
  })).filter((group) => group.files.length > 0);

  const toggle = (layer: ProjectFile['layer']) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-[var(--t1)]">
        Files <Badge variant="secondary">{files.length}</Badge>
      </h2>
      <div className="overflow-hidden rounded-xl border border-[var(--bor)] bg-[var(--sur)]">
        {grouped.map(({ layer, files: layerFiles }) => {
          const isOpen = expanded.has(layer);
          return (
            <div key={layer} className="border-b border-[var(--bor)] last:border-b-0">
              <button
                type="button"
                onClick={() => toggle(layer)}
                className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium text-[var(--t1)] hover:bg-[var(--sur2)]"
              >
                <span className="flex items-center gap-2">
                  {isOpen ? <ChevronDownIcon className="size-3.5" /> : <ChevronRightIcon className="size-3.5" />}
                  {LAYER_LABEL[layer]}
                  <span className="text-xs text-[var(--t3)]">({layerFiles.length})</span>
                </span>
              </button>
              {isOpen ? (
                <ul className="space-y-1 px-4 pb-3">
                  {layerFiles.map((file) => (
                    <li
                      key={file.id}
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-xs',
                        'hover:bg-[var(--sur2)]',
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {file.storage_url && !file.content ? (
                          <ExternalLinkIcon className="size-3.5 shrink-0 text-[var(--t3)]" />
                        ) : (
                          <FileTextIcon className="size-3.5 shrink-0 text-[var(--t3)]" />
                        )}
                        <span className="truncate font-mono text-[var(--t2)]">{file.name}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-[var(--t3)]">{formatBytes(file.size_bytes)}</span>
                        {file.content != null || file.storage_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpenFile(file)}
                          >
                            View
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
      <TemplateFileViewer file={openFile} open={openFile != null} onOpenChange={(o) => !o && setOpenFile(null)} />
    </section>
  );
}
