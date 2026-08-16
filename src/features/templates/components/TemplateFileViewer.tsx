import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ProjectFile } from '@/types/api';

type TemplateFileViewerProps = {
  file: ProjectFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const LAYER_BG: Record<ProjectFile['layer'], string> = {
  slide: 'bg-[#fdf6e3]',
  style: 'bg-[#f4f1ea]',
  layout: 'bg-[#eef2f7]',
  content: 'bg-[#f1f5f4]',
  context: 'bg-[#f5f0f6]',
  rules: 'bg-[#f7f3ec]',
  meta: 'bg-[#eef0f1]',
  asset: 'bg-[#f3f3f3]',
};

export function TemplateFileViewer({ file, open, onOpenChange }: TemplateFileViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{file?.name ?? 'File'}</DialogTitle>
          <DialogDescription>
            {file ? `${file.layer} layer · ${file.extension ?? 'txt'}` : null}
          </DialogDescription>
        </DialogHeader>
        {file?.storage_url && !file.content ? (
          <div className="rounded-md border border-[var(--bor)] bg-[var(--sur)] p-4 text-sm">
            External asset:{' '}
            <a className="text-[var(--cy)] underline" href={file.storage_url} target="_blank" rel="noreferrer">
              {file.storage_url}
            </a>
          </div>
        ) : (
          <pre
            className={`max-h-[60vh] overflow-auto rounded-md p-4 text-xs leading-relaxed text-[var(--t1)] ${file ? LAYER_BG[file.layer] : ''}`}
          >
            {file?.content ?? ''}
          </pre>
        )}
      </DialogContent>
    </Dialog>
  );
}