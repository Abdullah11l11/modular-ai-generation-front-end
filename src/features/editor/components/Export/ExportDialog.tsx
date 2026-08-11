import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEditorContext } from '@/features/editor/hooks/useEditorStore';
import { isScrollableType } from '@/features/editor/utils/editorMode';
import { assemblePreviewHtml } from '@/features/editor/hooks/useAssemblePreview';
import { groupSlides } from '@/features/editor/utils/groupSlides';
import { buildZip, downloadBytes } from '@/lib/zip';
import { buildPptxPresentation } from '@/features/editor/utils/mgfPptx';
import { DownloadIcon, FileArchiveIcon, FileCodeIcon, PresentationIcon, CheckCircleIcon } from 'lucide-react';
import type { ProjectFile } from '@/types/api';

const DECK_EXPORT_CSS = `
/* MGF deck-export chrome — frames, controls, counter. Sits alongside
   the project's own layout.css + style.css without overriding them. */
body { margin: 0; background: #050505; color: #f4f6fa; font-family: system-ui, -apple-system, sans-serif; }
.mgf-deck-export {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  box-sizing: border-box;
}
.mgf-deck-stage {
  position: relative;
  width: min(96vw, calc((96vh - 6rem) * 16 / 9));
  aspect-ratio: 16 / 9;
  max-height: calc(100vh - 6rem);
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
}
.mgf-deck-frame {
  position: absolute;
  inset: 0;
  display: none;
}
.mgf-deck-frame.is-active { display: block; }
.mgf-deck-frame section.mgf-slide {
  width: 100%;
  height: 100%;
}
.mgf-deck-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: min(96vw, calc((96vh - 6rem) * 16 / 9));
  margin-top: 1rem;
  color: #94a3b8;
  font-size: 13px;
}
.mgf-deck-controls button {
  background: transparent;
  color: #f4f6fa;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
}
.mgf-deck-controls button:hover { background: rgba(255, 255, 255, 0.08); }
.mgf-deck-controls button:disabled { opacity: 0.3; cursor: not-allowed; }
.mgf-deck-counter { font-variant-numeric: tabular-nums; }
.mgf-deck-hint { font-size: 11px; opacity: 0.7; }
`;

const DECK_EXPORT_JS = `
(function () {
  var frames = Array.prototype.slice.call(document.querySelectorAll('.mgf-deck-frame'));
  var counter = document.querySelector('.mgf-deck-counter');
  var prevBtn = document.querySelector('.mgf-deck-prev');
  var nextBtn = document.querySelector('.mgf-deck-next');
  if (frames.length === 0) return;
  var idx = 0;
  function show(i) {
    idx = Math.max(0, Math.min(frames.length - 1, i));
    frames.forEach(function (f, n) { f.classList.toggle('is-active', n === idx); });
    if (counter) counter.textContent = (idx + 1) + ' / ' + frames.length;
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === frames.length - 1;
    try { history.replaceState(null, '', '#slide-' + (idx + 1)); } catch (e) {}
  }
  if (prevBtn) prevBtn.addEventListener('click', function () { show(idx - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { show(idx + 1); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); show(idx - 1); }
    else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); show(idx + 1); }
    else if (e.key === 'Home') { e.preventDefault(); show(0); }
    else if (e.key === 'End') { e.preventDefault(); show(frames.length - 1); }
  });
  var hashMatch = (location.hash || '').match(/^#slide-(\d+)$/);
  if (hashMatch) show(parseInt(hashMatch[1], 10) - 1);
  else show(0);
})();
`;

/**
 * Build a single-file HTML export that behaves like the full-screen
 * preview: one slide per viewport, keyboard navigation, counter,
 * responsive stage. For non-deck types the caller's assembled HTML
 * (a scrollable page) is used as-is.
 */
function buildDeckHtml(
  slides: ReturnType<typeof groupSlides>,
  layoutHtml: string,
  layoutCss: string,
  styleCss: string,
  contentJson: string | null,
  direction: 'ltr' | 'rtl',
): string {
  const frames = slides
    .map((s, i) => {
      const inner = (s.files.slide?.content ?? '').trim();
      return `<div class="mgf-deck-frame" data-slide-index="${i}">${inner}</div>`;
    })
    .join('\n');

  const stage = `<div class="mgf-deck-stage">${frames}</div>`;
  const controls = `<div class="mgf-deck-controls">
    <div class="mgf-deck-hint">← / → navigate · Home / End jump</div>
    <div class="mgf-deck-counter">1 / ${slides.length}</div>
    <div>
      <button type="button" class="mgf-deck-prev">Previous</button>
      <button type="button" class="mgf-deck-next">Next</button>
    </div>
  </div>`;
  const body = `<div class="mgf-deck-export">${stage}${controls}</div>`;

  // Inject the deck body into the layout template (using the same
  // {{key}} + {{slides}} substitution as the editor canvas). The
  // project's own `layoutCss` is included so `.mgf-card`, `.mgf-grid-*`,
  // etc. still apply inside each slide frame.
  const html = assemblePreviewHtml({
    slideHtml: body,
    slideCss: '',
    layoutCss,
    layoutHtml,
    styleCss,
    contentJson,
    direction,
  });

  // Splice in the deck-only CSS + JS right before </head> and </body>.
  return html
    .replace('</head>', `<style>${DECK_EXPORT_CSS}</style></head>`)
    .replace('</body>', `<script>${DECK_EXPORT_JS}</script></body>`);
}

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: ProjectFile[];
  projectName: string;
};

type ExportFormat = 'zip' | 'html' | 'pptx';

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

    if (state.editorMode === 'single-page') {
      const slideHtml = findFile(files, 'slide', 'content.html')?.content ?? '';
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

    const slides = groupSlides(files);

    // Deck-style projects (presentation, carousel) export as a navigable
    // deck: one slide per viewport, keyboard nav, counter. Matches what
    // the user sees in the full-screen preview.
    if (!scrollable) {
      return buildDeckHtml(slides, layoutHtml, layoutCss, styleCss, contentJson, state.direction);
    }

    // Scrollable types (website, poster, infographic, document) keep
    // their natural scroll behaviour.
    const slideHtml = slides.map((s) => s.files.slide?.content ?? '').join('\n');
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
    } else if (format === 'pptx') {
      setLastDownload('Generating PowerPoint…');
      buildPptxPresentation({ files, projectName }).then(
        (bytes) => {
          downloadBytes(
            bytes,
            `${baseName}.pptx`,
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          );
          setLastDownload(`${baseName}.pptx`);
        },
        (err) => {
          console.error('PPTX export failed', err);
          setLastDownload(`PowerPoint export failed: ${(err as Error).message ?? 'unknown error'}`);
        },
      );
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
          <div className="grid grid-cols-3 gap-3">
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
            <FormatCard
              icon={<PresentationIcon className="size-5" />}
              title="PowerPoint"
              description="Native .pptx. Editable in PowerPoint, Keynote, and Google Slides. Layout is approximated."
              selected={format === 'pptx'}
              onClick={() => setFormat('pptx')}
            />
          </div>

          {/* File list */}
          <div className="rounded-md border border-(--bor2)">
            <div className="flex items-center justify-between border-b border-(--bor2) bg-(--sur-2) px-3 py-2 text-xs font-medium text-(--t2)">
              <span>{fileRows.length} files · {humanBytes(totalBytes)}</span>
              <span className="text-(--t3)">
                {format === 'zip' ? 'will be archived as-is' : format === 'pptx' ? 'rendered into native PPTX' : 'merged into one HTML'}
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
              Download {format === 'zip' ? '.zip' : format === 'pptx' ? '.pptx' : '.html'}
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
