import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEditorContext } from '@/features/editor/hooks/useEditorStore';
import { isScrollableType } from '@/features/editor/utils/editorMode';
import { assemblePreviewHtml } from '@/features/editor/hooks/useAssemblePreview';
import { groupSlides } from '@/features/editor/utils/groupSlides';
import { buildZip, downloadBytes } from '@/lib/zip';
import { DownloadIcon, FileArchiveIcon, FileCodeIcon, CheckCircleIcon } from 'lucide-react';
import type { ProjectFile } from '@/types/api';

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: ProjectFile[];
  projectName: string;
};

type ExportFormat = 'zip' | 'html';

function findFile(files: ProjectFile[], layer: string, name: string): ProjectFile | undefined {
  return files.find((f) => f.layer === layer && f.name === name);
}

function sanitizeFilename(name: string): string {
  return (
    name
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'project'
  );
}

function fileBytes(file: ProjectFile): number {
  if (file.content) {
    return new TextEncoder().encode(file.content).length;
  }
  return file.size_bytes ?? 0;
}

function humanBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function ExportDialog({ open, onOpenChange, files, projectName }: ExportDialogProps) {
  const { state } = useEditorContext();
  const [format, setFormat] = useState<ExportFormat>('zip');
  const [lastDownload, setLastDownload] = useState<string | null>(null);

  const scrollable = isScrollableType(state.projectType);
  const fileRows = useMemo(() => {
    return files
      .filter((f) => f.content != null && f.content !== '')
      .map((f) => ({
        id: f.id,
        path: `${f.layer}/${f.name}`,
        bytes: fileBytes(f),
      }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [files]);

  const totalBytes = useMemo(
    () => fileRows.reduce((sum, r) => sum + r.bytes, 0),
    [fileRows],
  );

  function buildHtmlBundle(): string {
    const layoutHtml = findFile(files, 'layout', 'layout.html')?.content ?? '';
    const layoutCss = findFile(files, 'layout', 'layout.css')?.content ?? '';
    const styleCss = findFile(files, 'style', 'style.css')?.content ?? '';
    const contentJson =
      findFile(files, 'content', 'data.json')?.content ??
      findFile(files, 'content', 'content.json')?.content ??
      null;

    let slideHtml = '';
    if (state.editorMode === 'single-page') {
      slideHtml = findFile(files, 'slide', 'content.html')?.content ?? '';
    } else {
      const slides = groupSlides(files);
      // For deck-style types, the single-file export renders every slide
      // concatenated (each in its own .mgf-slide section) so the result
      // looks like a self-contained webpage of the deck.
      slideHtml = slides.map((s) => s.files.slide?.content ?? '').join('\n');
    }

    return assemblePreviewHtml({
      slideHtml,
      slideCss: '',
      layoutCss,
      layoutHtml,
      styleCss,
      contentJson,
      direction: state.direction,
    });
  }

  function handleDownload() {
    const baseName = sanitizeFilename(projectName);
    if (format === 'zip') {
      const entries = files
        .filter((f) => f.content != null && f.content !== '')
        .map((f) => ({
          name: `${f.layer}/${f.name}`,
          data: f.content ?? '',
        }));
      const zipBytes = buildZip(entries);
      downloadBytes(zipBytes, `${baseName}.zip`, 'application/zip');
      setLastDownload(`${baseName}.zip`);
    } else {
      const html = buildHtmlBundle();
      const encoder = new TextEncoder();
      downloadBytes(encoder.encode(html), `${baseName}.html`, 'text/html');
      setLastDownload(`${baseName}.html`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export "{projectName}"</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Format picker */}
          <div className="grid grid-cols-2 gap-3">
            <FormatCard
              icon={<FileArchiveIcon className="size-5" />}
              title="ZIP archive"
              description="All project files in their original structure. Best for editing locally or republishing."
              selected={format === 'zip'}
              onClick={() => setFormat('zip')}
            />
            <FormatCard
              icon={<FileCodeIcon className="size-5" />}
              title="Single HTML"
              description={
                scrollable
                  ? 'One self-contained HTML file. Open it directly in any browser.'
                  : 'All slides merged into one self-contained HTML file.'
              }
              selected={format === 'html'}
              onClick={() => setFormat('html')}
            />
          </div>

          {/* File list */}
          <div className="rounded-md border border-(--bor2)">
            <div className="flex items-center justify-between border-b border-(--bor2) bg-(--sur-2) px-3 py-2 text-xs font-medium text-(--t2)">
              <span>{fileRows.length} files · {humanBytes(totalBytes)}</span>
              <span className="text-(--t3)">
                {format === 'zip' ? 'will be archived as-is' : 'merged into one HTML'}
              </span>
            </div>
            <ul className="max-h-48 overflow-y-auto divide-y divide-(--bor2) text-sm">
              {fileRows.length === 0 ? (
                <li className="px-3 py-4 text-center text-(--t3)">No content to export yet.</li>
              ) : (
                fileRows.slice(0, 30).map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 px-3 py-1.5">
                    <span className="truncate font-mono text-xs text-(--t2)">{row.path}</span>
                    <span className="shrink-0 text-xs text-(--t3)">{humanBytes(row.bytes)}</span>
                  </li>
                ))
              )}
              {fileRows.length > 30 && (
                <li className="px-3 py-2 text-center text-xs text-(--t3)">
                  +{fileRows.length - 30} more files
                </li>
              )}
            </ul>
          </div>

          {lastDownload && (
            <div className="flex items-center gap-2 rounded-md border border-(--cy) bg-(--cy)/10 px-3 py-2 text-sm text-(--cy)">
              <CheckCircleIcon className="size-4" />
              <span>Downloaded <code className="font-mono">{lastDownload}</code></span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button variant="accent" size="sm" onClick={handleDownload} disabled={fileRows.length === 0}>
              <DownloadIcon className="size-3.5" />
              Download {format === 'zip' ? '.zip' : '.html'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type FormatCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
};

function FormatCard({ icon, title, description, selected, onClick }: FormatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex flex-col items-start gap-2 rounded-md border p-3 text-left transition',
        selected
          ? 'border-(--cy) bg-(--cy)/10 ring-1 ring-(--cy)'
          : 'border-(--bor2) hover:border-(--bor3) hover:bg-(--sur-2)',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 text-(--t1)">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-xs leading-relaxed text-(--t3)">{description}</p>
    </button>
  );
}
