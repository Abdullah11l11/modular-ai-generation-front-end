import { useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileArchive,
  FileCode,
  FileImage,
  FileText,
  Loader2,
  Presentation,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { runExport, downloadExportResult, type ExportFormat, type ExportProgress } from '@/features/editor/utils/runExport';
import { isScrollableType } from '@/features/editor/utils/editorMode';
import { useEditorContext } from '@/features/editor/hooks/useEditorStore';
import { readProjectSize, getOutputTypeInfo } from '@/features/types/types/outputTypeMap';
import type { ProjectFile } from '@/types/api';

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: ProjectFile[];
  projectName: string;
};

const FORMATS: {
  id: ExportFormat;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'zip', title: 'ZIP archive', description: 'All source files. Best for editing locally.', icon: FileArchive },
  { id: 'html', title: 'Single HTML', description: 'One self-contained file. Open it directly in any browser.', icon: FileCode },
  { id: 'pptx', title: 'PowerPoint', description: 'Native .pptx. Editable. Layout is approximated.', icon: Presentation },
  { id: 'pdf', title: 'PDF', description: 'Print-ready. One page per slide.', icon: FileText },
  { id: 'png', title: 'PNG images', description: 'Multi-slide → ZIP. Scrollable → one tall page.', icon: FileImage },
  { id: 'jpg', title: 'JPG images', description: 'Same as PNG with JPG compression. Smaller files.', icon: FileImage },
];

const RASTER_FORMATS: ExportFormat[] = ['pdf', 'png', 'jpg'];
const SCALE_OPTIONS = [
  { value: 1, label: '1× (native)' },
  { value: 2, label: '2× (HiDPI)' },
  { value: 3, label: '3× (print)' },
];

function humanBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function ExportDialog({ open, onOpenChange, files, projectName }: ExportDialogProps) {
  const { state } = useEditorContext();

  // Default PDF page size follows the project's persisted size (A4
  // projects export as A4; everything else uses the slide aspect).
  // Declared before the useState below so the lazy initializer can
  // use it safely.
  const projectSize = readProjectSize(files) ?? getOutputTypeInfo(state.projectType).defaultSize;

  const [format, setFormat] = useState<ExportFormat>('zip');
  const [scale, setScale] = useState<number>(2);
  const [jpgQuality, setJpgQuality] = useState<number>(92);
  const [pdfPageSize, setPdfPageSize] = useState<'slide' | 'a4' | 'letter'>(
    () => (projectSize === 'a4' ? 'a4' : 'slide'),
  );
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [done, setDone] = useState<{ filename: string; bytes: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<AbortController | null>(null);

  const scrollable = isScrollableType(state.projectType);
  const isRaster = RASTER_FORMATS.includes(format);

  const fileRows = useMemo(() => {
    return files
      .filter((f) => f.content != null && f.content !== '')
      .map((f) => ({
        id: f.id,
        path: `${f.layer}/${f.name}`,
        bytes: f.content ? new TextEncoder().encode(f.content).length : (f.size_bytes ?? 0),
      }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [files]);

  const totalBytes = useMemo(
    () => fileRows.reduce((sum, r) => sum + r.bytes, 0),
    [fileRows],
  );

  const isBusy = progress != null && progress.phase !== 'done' && progress.phase !== 'error';

  function setDone_(p: ExportProgress) {
    setProgress(p);
  }

  async function handleDownload() {
    if (fileRows.length === 0) return;
    setError(null);
    setDone(null);
    const ctrl = new AbortController();
    cancelRef.current = ctrl;
    try {
      const result = await runExport({
        format,
        files,
        projectName,
        projectType: state.projectType,
        direction: state.direction,
        options: { scale, jpgQuality: jpgQuality / 100, pdfPageSize },
        onProgress: setDone_,
        signal: ctrl.signal,
      });
      downloadExportResult(result);
      setDone({ filename: result.filename, bytes: result.bytes.byteLength });
      setProgress({ phase: 'done', current: 1, total: 1 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // user-initiated abort is not really an error
      if (msg !== 'aborted') {
        setError(msg);
        setProgress({ phase: 'error', current: 0, total: 0, message: msg });
      } else {
        setProgress(null);
      }
    } finally {
      cancelRef.current = null;
    }
  }

  function handleCancel() {
    cancelRef.current?.abort();
  }

  function handleClose() {
    if (isBusy) return;
    onOpenChange(false);
    // Reset transient state next time the dialog opens.
    setTimeout(() => {
      setProgress(null);
      setError(null);
      setDone(null);
    }, 200);
  }

  const selectedMeta = FORMATS.find((f) => f.id === format);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[99vw]! w-[99vw]! max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export &quot;{projectName}&quot;</DialogTitle>
          <DialogDescription>
            Pick a format and configure options. The export keeps the project&apos;s direction (LTR/RTL) and fonts.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Format picker */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {FORMATS.map((f) => {
              const Icon = f.icon;
              const active = format === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFormat(f.id)}
                  className={[
                    'flex flex-col items-start gap-2 rounded-md border p-3 text-left transition',
                    active
                      ? 'border-(--cy) bg-(--cy)/10 ring-1 ring-(--cy)'
                      : 'border-(--bor2) hover:border-(--bor3) hover:bg-(--sur-2)',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2 text-(--t1)">
                    <Icon className="size-5" />
                    <span className="text-sm font-medium">{f.title}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-(--t3)">{f.description}</p>
                </button>
              );
            })}
          </div>

          {/* Per-format options */}
          {isRaster && (
            <div className="grid grid-cols-1 gap-4 rounded-md border border-(--bor2) bg-(--sur-2)/40 p-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Resolution</Label>
                <Select value={String(scale)} onValueChange={(v) => setScale(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCALE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={String(o.value)}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-(--t3)">Doubles the captured pixel count.</p>
              </div>

              {format === 'jpg' && (
                <div className="space-y-2">
                  <Label>JPG quality · {jpgQuality}%</Label>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={jpgQuality}
                    onChange={(e) => setJpgQuality(Number(e.target.value))}
                    className="w-full accent-(--cy)"
                    aria-label="JPG quality"
                  />
                  <p className="text-[11px] text-(--t3)">Lower = smaller file.</p>
                </div>
              )}

              {format === 'pdf' && (
                <div className="space-y-2">
                  <Label>PDF page size</Label>
                  <Select value={pdfPageSize} onValueChange={(v) => setPdfPageSize(v as typeof pdfPageSize)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slide">Match slide (1:1)</SelectItem>
                      <SelectItem value="a4">A4 portrait</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-(--t3)">
                    {scrollable
                      ? 'Scrollable types always fit to one tall page.'
                      : 'A4/Letter pads the slide to paper size.'}
                  </p>
                </div>
              )}

              <div className="space-y-2 sm:col-span-1">
                <Label>Summary</Label>
                <p className="rounded-md border border-(--bor2) bg-(--sur-1) px-2.5 py-1.5 text-xs text-(--t2)">
                  {scrollable
                    ? 'Scrollable — one tall page, full document height.'
                    : 'Deck — one raster per slide.'}
                </p>
              </div>
            </div>
          )}

          {/* File list */}
          <div className="rounded-md border border-(--bor2)">
            <div className="flex items-center justify-between border-b border-(--bor2) bg-(--sur-2) px-3 py-2 text-xs font-medium text-(--t2)">
              <span>{fileRows.length} files · {humanBytes(totalBytes)}</span>
              <span className="text-(--t3)">
                {selectedMeta?.description ?? ''}
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

          {/* Progress / status region. aria-live so screen readers announce changes. */}
          <div className="space-y-2" aria-live="polite">
            {isBusy && (
              <div className="flex items-center gap-2 rounded-md border border-(--cy) bg-(--cy)/10 px-3 py-2 text-sm text-(--cy)">
                <Loader2 className="size-4 animate-spin" />
                <span>
                  {progress?.message ?? 'Working…'}
                  {progress?.total ? ` (${progress.current}/${progress.total})` : ''}
                </span>
              </div>
            )}
            {done && progress?.phase === 'done' && (
              <div className="flex items-center gap-2 rounded-md border border-(--cy) bg-(--cy)/10 px-3 py-2 text-sm text-(--cy)">
                <CheckCircle2 className="size-4" />
                <span>
                  Downloaded <code className="font-mono">{done.filename}</code> ({humanBytes(done.bytes)})
                </span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-(--rd) bg-(--rd)/10 px-3 py-2 text-sm text-(--rd)">
                <XCircle className="size-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
          <p className="text-xs text-(--t3)">
            {scrollable ? 'Scrollable type · one tall page' : 'Deck type · one page per slide'}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={isBusy}>
              Close
            </Button>
            {isBusy ? (
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            ) : (
              <Button
                variant="accent"
                size="sm"
                onClick={handleDownload}
                disabled={fileRows.length === 0}
              >
                <Download className="size-3.5" />
                Export
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
