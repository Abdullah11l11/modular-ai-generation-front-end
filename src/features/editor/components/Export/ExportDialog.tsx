import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRequestExport } from '@/features/export/hooks/useRequestExport';
import { useExportJobPoller } from '@/features/editor/hooks/useExportJobPoller';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2Icon, DownloadIcon, FileDownIcon } from 'lucide-react';
import { toastSuccess, toastError } from '@/lib/toast';
import type { Id } from '@/types/api';
import type { ExportOptions } from '@/features/export/types/exportRequest';

const FORMAT_OPTIONS = [
  { value: 'html' as const, label: 'HTML' },
  { value: 'pdf' as const, label: 'PDF' },
  { value: 'png' as const, label: 'PNG' },
  { value: 'jpg' as const, label: 'JPG' },
  { value: 'zip' as const, label: 'ZIP' },
  { value: 'md' as const, label: 'Markdown' },
];

const SHOW_PAGE_SIZE = ['pdf'];
const SHOW_WIDTH_HEIGHT = ['png', 'jpg', 'pdf'];
const SHOW_QUALITY = ['jpg'];

type ExportDialogInnerProps = {
  projectId: Id;
  onClose: () => void;
};

function ExportDialogInner({ projectId, onClose }: ExportDialogInnerProps) {
  const queryClient = useQueryClient();
  const requestExport = useRequestExport();
  const [format, setFormat] = useState<string>('pdf');
  const [pageSize, setPageSize] = useState<string>('A4');
  const [widthPx, setWidthPx] = useState('');
  const [heightPx, setHeightPx] = useState('');
  const [quality, setQuality] = useState('90');
  const [currentJobId, setCurrentJobId] = useState<Id | null>(null);
  const [exporting, setExporting] = useState(false);
  const processedRef = useRef<Set<Id>>(new Set());

  const poller = useExportJobPoller(currentJobId);

  useEffect(() => {
    const job = poller.data;
    if (!job || !currentJobId) return;
    if (processedRef.current.has(currentJobId)) return;

    if (job.status === 'ready') {
      processedRef.current.add(currentJobId);
      toastSuccess('Export ready for download');
      queryClient.invalidateQueries({ queryKey: ['export-jobs', projectId] });
      const t = setTimeout(() => setExporting(false), 0);
      return () => clearTimeout(t);
    }

    if (job.status === 'failed') {
      processedRef.current.add(currentJobId);
      toastError('Export failed. Please try again.');
      const t = setTimeout(() => {
        setExporting(false);
        setCurrentJobId(null);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [poller.data, currentJobId, projectId, queryClient]);

  const buildOptions = (): ExportOptions | undefined => {
    const options: ExportOptions = {};

    if (SHOW_PAGE_SIZE.includes(format)) {
      options.page_size = pageSize as ExportOptions['page_size'];
    }
    if (SHOW_WIDTH_HEIGHT.includes(format)) {
      const w = parseInt(widthPx, 10);
      const h = parseInt(heightPx, 10);
      if (!isNaN(w)) options.width_px = w;
      if (!isNaN(h)) options.height_px = h;
    }
    if (SHOW_QUALITY.includes(format)) {
      options.quality = Math.min(100, Math.max(1, parseInt(quality, 10) || 90));
    }

    return Object.keys(options).length > 0 ? options : undefined;
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const job = await requestExport.mutateAsync({
        projectId,
        payload: {
          format: format as 'html' | 'pdf' | 'png' | 'jpg' | 'pptx' | 'zip' | 'md',
          options: buildOptions(),
        },
      });
      setCurrentJobId(job.id);
    } catch {
      toastError('Failed to start export. Please try again.');
      setExporting(false);
    }
  };

  const isProcessing = exporting || poller.isFetching;
  const job = poller.data;

  const handleDownload = () => {
    if (job?.download_url) {
      window.open(job.download_url, '_blank');
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileDownIcon className="size-4 text-(--cy)" />
          Export Project
        </DialogTitle>
        <DialogDescription>
          Export your project to a downloadable file.
        </DialogDescription>
      </DialogHeader>

      {isProcessing && job ? (
        <div className="flex flex-col items-center justify-center gap-3 py-6">
          {job.status === 'ready' ? (
            <>
              <div className="flex size-12 items-center justify-center rounded-full bg-green-500/10">
                <DownloadIcon className="size-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-(--t1)">Export ready!</p>
              <Button variant="accent" onClick={handleDownload}>
                <DownloadIcon className="mr-1.5 size-4" />
                Download
              </Button>
            </>
          ) : (
            <>
              <Loader2Icon className="size-8 animate-spin text-(--cy)" />
              <p className="text-sm font-medium text-(--t1)">
                {job.status === 'pending' ? 'Queued...' : 'Processing...'}
              </p>
              <Badge
                className={`text-[11px] ${
                  job.status === 'processing'
                    ? 'bg-blue-500/10 text-blue-600'
                    : 'bg-yellow-500/10 text-yellow-600'
                }`}
              >
                {job.status}
              </Badge>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1 block text-[13px] font-medium text-(--t2)">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {SHOW_PAGE_SIZE.includes(format) && (
            <div>
              <Label className="mb-1 block text-[13px] font-medium text-(--t2)">Page Size</Label>
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {SHOW_WIDTH_HEIGHT.includes(format) && (
            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="mb-1 block text-[13px] font-medium text-(--t2)">
                  Width <span className="text-(--t3)">(px)</span>
                </Label>
                <Input
                  value={widthPx}
                  onChange={(e) => setWidthPx(e.target.value)}
                  placeholder="1920"
                  className="h-8 text-[13px]"
                  type="number"
                  min={1}
                />
              </div>
              <div className="flex-1">
                <Label className="mb-1 block text-[13px] font-medium text-(--t2)">
                  Height <span className="text-(--t3)">(px)</span>
                </Label>
                <Input
                  value={heightPx}
                  onChange={(e) => setHeightPx(e.target.value)}
                  placeholder="1080"
                  className="h-8 text-[13px]"
                  type="number"
                  min={1}
                />
              </div>
            </div>
          )}

          {SHOW_QUALITY.includes(format) && (
            <div>
              <Label className="mb-1 block text-[13px] font-medium text-(--t2)">
                Quality <span className="text-(--t3)">(1-100)</span>
              </Label>
              <Input
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                placeholder="90"
                className="h-8 text-[13px]"
                type="number"
                min={1}
                max={100}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={handleExport}
              disabled={requestExport.isPending}
            >
              {requestExport.isPending && <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />}
              Export
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  );
}

type ExportDialogProps = {
  projectId: Id;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExportDialog({ projectId, open, onOpenChange }: ExportDialogProps) {
  const openCountRef = useRef(0);
  const prevOpenRef = useRef(open);

  if (open && !prevOpenRef.current) {
    openCountRef.current++;
  }
  prevOpenRef.current = open;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ExportDialogInner
          key={`export-${openCountRef.current}`}
          projectId={projectId}
          onClose={() => onOpenChange(false)}
        />
      )}
    </Dialog>
  );
}
