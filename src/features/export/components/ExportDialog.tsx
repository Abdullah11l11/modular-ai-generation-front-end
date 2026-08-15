import { useEffect, useMemo, useState } from 'react';
import {
  Download,
  FileArchive,
  FileCode2,
  FileImage,
  FileText,
  FileType2,
  Loader2,
  Presentation,
  RefreshCw,
  X,
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

import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { useCreateExport } from '../hooks/useCreateExport';
import { useExportJob } from '../hooks/useExportJob';

import type { ExportFormat } from '../types/exportFormat';
import type { ExportOptions } from '../types/exportOptions';

export interface ExportSlide {
  id: string;
  name: string;
  sort_order?: number;
}

interface ExportDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slides?: ExportSlide[];
}

const FORMAT_META: Record<
  ExportFormat,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{
      className?: string;
    }>;
  }
> = {
  html: {
    label: 'HTML',
    description: 'Web page with CSS',
    icon: FileCode2,
  },

  pdf: {
    label: 'PDF',
    description: 'Print-ready document',
    icon: FileText,
  },

  png: {
    label: 'PNG',
    description: 'High-quality images',
    icon: FileImage,
  },

  jpg: {
    label: 'JPG',
    description: 'Compressed images',
    icon: FileImage,
  },

  pptx: {
    label: 'PPTX',
    description: 'Microsoft PowerPoint',
    icon: Presentation,
  },

  zip: {
    label: 'ZIP',
    description: 'All project files',
    icon: FileArchive,
  },

  md: {
    label: 'Markdown',
    description: 'Content as Markdown',
    icon: FileType2,
  },
};

const IMAGE_FORMATS: ExportFormat[] = ['png', 'jpg'];

const SLIDE_FORMATS: ExportFormat[] = [
  'png',
  'jpg',
  'pdf',
  'pptx',
];

export function ExportDialog({
  projectId,
  open,
  onOpenChange,
  slides = [],
}: ExportDialogProps) {
  const [format, setFormat] =
    useState<ExportFormat>('pdf');

  const [pageSize, setPageSize] =
    useState<'A4' | 'letter' | 'custom'>('A4');

  const [widthPx, setWidthPx] =
    useState<number | undefined>();

  const [heightPx, setHeightPx] =
    useState<number | undefined>();

  const [quality, setQuality] =
    useState(90);

  const [selectedSlides, setSelectedSlides] =
    useState<string[]>([]);

  const [jobId, setJobId] =
    useState<string | null>(null);

  const createExportMutation =
    useCreateExport(projectId);

  const exportJobQuery =
    useExportJob(jobId);

  const exportJob = exportJobQuery.data;

  const isImageExport =
    IMAGE_FORMATS.includes(format);

  const supportsSlides =
    SLIDE_FORMATS.includes(format) &&
    slides.length > 0;

  const showPageSize =
    format === 'pdf' ||
    format === 'png' ||
    format === 'jpg';

  const showDimensions =
    pageSize === 'custom' ||
    isImageExport;

  const showQuality =
    format === 'jpg';

  const isCreating =
    createExportMutation.isPending;

  const isProcessing =
    Boolean(jobId) &&
    (
      exportJob?.status === 'pending' ||
      exportJob?.status === 'processing'
    );

  const isReady =
    exportJob?.status === 'ready';

  const isFailed =
    exportJob?.status === 'failed';

  const downloadExpired = useMemo(() => {
    if (!exportJob?.expires_at) {
      return false;
    }

    return (
      new Date(exportJob.expires_at).getTime() <=
      Date.now()
    );
  }, [exportJob?.expires_at]);

  useEffect(() => {
    if (!open) {
      setJobId(null);
      createExportMutation.reset();
    }
  }, [open]);

  useEffect(() => {
    if (
      format === 'html' ||
      format === 'zip' ||
      format === 'md'
    ) {
      setSelectedSlides([]);
    }
  }, [format]);

  useEffect(() => {
    if (!supportsSlides) {
      setSelectedSlides([]);
    }
  }, [supportsSlides]);

  function toggleSlide(slideId: string) {
    setSelectedSlides((current) =>
      current.includes(slideId)
        ? current.filter((id) => id !== slideId)
        : [...current, slideId],
    );
  }

  function buildOptions(): ExportOptions {
    const options: ExportOptions = {};

    if (showPageSize) {
      options.page_size = pageSize;
    }

    if (showDimensions) {
      if (widthPx) {
        options.width_px = widthPx;
      }

      if (heightPx) {
        options.height_px = heightPx;
      }
    }

    if (showQuality) {
      options.quality = quality;
    }

    if (
      supportsSlides &&
      selectedSlides.length > 0
    ) {
      options.slides = selectedSlides;
    }

    return options;
  }

  async function handleExport() {
    try {
      const job = await createExportMutation.mutateAsync({
        format,
        options: buildOptions(),
      });

      setJobId(job.id);
    } catch {
      // Error is exposed by createExportMutation.error.
    }
  }

  function handleDownload() {
    if (
      !exportJob?.download_url ||
      downloadExpired
    ) {
      return;
    }

    window.location.assign(
      exportJob.download_url,
    );
  }

  function handleRegenerate() {
    setJobId(null);
    createExportMutation.reset();
  }

  function handleClose() {
    if (!isProcessing) {
      onOpenChange(false);
    }
  }

  const selectedFormat =
    FORMAT_META[format];

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent
        className="
          w-[min(620px,calc(100vw-32px))]
          max-h-[80vh]
          overflow-y-auto
          rounded-2xl
          border
          p-0
          shadow-2xl
        "
      >
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Download className="size-5" />
            Export project
          </DialogTitle>

          <DialogDescription>
            Choose a format and configure the
            export options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-6">
          {!jobId && (
            <>
              {/* FORMAT */}
              <section className="space-y-3">
                <Label>
                  Export format
                </Label>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(
                    Object.keys(
                      FORMAT_META,
                    ) as ExportFormat[]
                  ).map((item) => {
                    const meta =
                      FORMAT_META[item];

                    const Icon = meta.icon;

                    const active =
                      format === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setFormat(item)
                        }
                        className={`
                          group
                          rounded-xl
                          border
                          p-3  
                          text-left
                          transition-all
                          duration-150
                          hover:-translate-y-px
                          ${
                            active
                              ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500'
                              : 'border-border bg-background hover:bg-muted/50'
                          }
                        `}
                      >
                        <div className="flex items-center  justify-between">
                          <Icon
                            className={`
                              size-5
                              ${
                                active
                                  ? 'text-cyan-500'
                                  : 'text-muted-foreground'
                              }
                            `}
                          />

                          {active && (
                            <Badge
                              variant="secondary"
                              className="text-[10px]"
                            >
                              Selected
                            </Badge>
                          )}
                        </div>

                        <div className="mt-2 text-sm font-semibold ">
                          {meta.label}
                        </div>

                        <div className="mt-1 text-[11px] leading-4 text-muted-foreground">
                          {meta.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <Separator />

              {/* PAGE SIZE */}
              {showPageSize && (
                <section className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Page settings
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Configure the output page size.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Page size
                    </Label>

                    <Select
                      value={pageSize}
                      onValueChange={(value) =>
                        setPageSize(
                          value as
                            | 'A4'
                            | 'letter'
                            | 'custom',
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="A4">
                          A4
                        </SelectItem>

                        <SelectItem value="letter">
                          Letter
                        </SelectItem>

                        <SelectItem value="custom">
                          Custom
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {showDimensions && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="width">
                          Width (px)
                        </Label>

                        <Input
                          id="width"
                          type="number"
                          min={1}
                          placeholder="1920"
                          value={
                            widthPx ?? ''
                          }
                          onChange={(event) =>
                            setWidthPx(
                              event.target.value
                                ? Number(
                                    event.target
                                      .value,
                                  )
                                : undefined,
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="height">
                          Height (px)
                        </Label>

                        <Input
                          id="height"
                          type="number"
                          min={1}
                          placeholder="1080"
                          value={
                            heightPx ?? ''
                          }
                          onChange={(event) =>
                            setHeightPx(
                              event.target.value
                                ? Number(
                                    event.target
                                      .value,
                                  )
                                : undefined,
                            )
                          }
                        />
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* JPG QUALITY */}
              {showQuality && (
                <>
                  <Separator />

                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold">
                          Image quality
                        </h3>

                        <p className="text-xs text-muted-foreground">
                          JPG quality from 1 to 100.
                        </p>
                      </div>

                      <Badge variant="outline">
                        {quality}%
                      </Badge>
                    </div>

                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={quality}
                      onChange={(event) =>
                        setQuality(
                          Number(
                            event.target.value,
                          ),
                        )
                      }
                      className="w-full accent-cyan-500"
                    />
                  </section>
                </>
              )}

              {/* SLIDES */}
              {supportsSlides && (
                <>
                  <Separator />

                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold">
                          Slides
                        </h3>

                        <p className="text-xs text-muted-foreground">
                          Leave empty to export all slides.
                        </p>
                      </div>

                      {selectedSlides.length > 0 && (
                        <Badge variant="secondary">
                          {selectedSlides.length}{' '}
                          selected
                        </Badge>
                      )}
                    </div>

                    <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border p-3">
                      {slides.map((slide, index) => (
                        <label
                          key={slide.id}
                          className="
                            flex
                            cursor-pointer
                            items-center
                            gap-3
                            rounded-lg
                            p-2
                            transition-colors
                            hover:bg-muted
                          "
                        >
                          <Checkbox
                            checked={selectedSlides.includes(
                              slide.id,
                            )}
                            onCheckedChange={() =>
                              toggleSlide(
                                slide.id,
                              )
                            }
                          />

                          <span className="w-8 text-xs text-muted-foreground">
                            {String(
                              index + 1,
                            ).padStart(
                              2,
                              '0',
                            )}
                          </span>

                          <span className="truncate text-sm">
                            {slide.name}
                          </span>
                        </label>
                      ))}
                    </div>

                    {selectedSlides.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setSelectedSlides([])
                        }
                      >
                        <X />
                        Export all slides
                      </Button>
                    )}
                  </section>
                </>
              )}

              {createExportMutation.isError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {createExportMutation.error instanceof
                  Error
                    ? createExportMutation.error
                        .message
                    : 'Unable to start export.'}
                </div>
              )}
            </>
          )}

          {/* JOB STATUS */}
          {jobId && (
            <ExportJobStatus
              format={format}
              status={
                exportJob?.status ??
                'pending'
              }
              isFetching={
                exportJobQuery.isFetching
              }
              isReady={Boolean(isReady)}
              isFailed={Boolean(isFailed)}
              downloadExpired={
                downloadExpired
              }
              expiresAt={
                exportJob?.expires_at
              }
              errorMessage={
                exportJob?.error_message
              }
              onDownload={
                handleDownload
              }
              onRegenerate={
                handleRegenerate
              }
            />
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          {!jobId ? (
            <>
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={isCreating}
              >
                Cancel
              </Button>

              <Button
                onClick={handleExport}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Starting export...
                  </>
                ) : (
                  <>
                    <Download />
                    Export {selectedFormat.label}
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ExportJobStatusProps {
  format: ExportFormat;
  status:
    | 'pending'
    | 'processing'
    | 'ready'
    | 'failed';
  isFetching: boolean;
  isReady: boolean;
  isFailed: boolean;
  downloadExpired: boolean;
  expiresAt: string | null | undefined;
  errorMessage: string | null | undefined;
  onDownload: () => void;
  onRegenerate: () => void;
}

function ExportJobStatus({
  format,
  status,
  isFetching,
  isReady,
  isFailed,
  downloadExpired,
  expiresAt,
  errorMessage,
  onDownload,
  onRegenerate,
}: ExportJobStatusProps) {
  const progress =
    status === 'pending'
      ? 20
      : status === 'processing'
        ? 65
        : status === 'ready'
          ? 100
          : 100;

  if (isFailed) {
    return (
      <div className="space-y-5 py-5">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <X className="size-6" />
        </div>

        <div className="text-center">
          <h3 className="font-semibold">
            Export failed
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {errorMessage ??
              'Something went wrong while exporting the project.'}
          </p>
        </div>

        <Button
          className="w-full"
          onClick={onRegenerate}
        >
          <RefreshCw />
          Try again
        </Button>
      </div>
    );
  }

  if (isReady && !downloadExpired) {
    return (
      <div className="space-y-5 py-5">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500">
          <Download className="size-6" />
        </div>

        <div className="text-center">
          <h3 className="font-semibold">
            Export ready
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Your {format.toUpperCase()} file is ready
            to download.
          </p>

          {expiresAt && (
            <p className="mt-2 text-xs text-muted-foreground">
              Link expires{' '}
              {new Date(
                expiresAt,
              ).toLocaleString()}
            </p>
          )}
        </div>

        <Button
          className="w-full"
          onClick={onDownload}
        >
          <Download />
          Download file
        </Button>
      </div>
    );
  }

  if (isReady && downloadExpired) {
    return (
      <div className="space-y-5 py-5">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
          <RefreshCw className="size-6 text-muted-foreground" />
        </div>

        <div className="text-center">
          <h3 className="font-semibold">
            Download link expired
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            The signed download URL is no longer
            valid.
          </p>
        </div>

        <Button
          className="w-full"
          onClick={onRegenerate}
        >
          <RefreshCw />
          Generate a new export
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-cyan-500/10">
        <Loader2 className="size-6 animate-spin text-cyan-500" />
      </div>

      <div className="text-center">
        <h3 className="font-semibold">
          {status === 'pending'
            ? 'Export queued'
            : 'Preparing your export'}
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          This may take a few moments.
        </p>
      </div>

      <div className="space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-cyan-500 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>
            {status === 'pending'
              ? 'Queued'
              : 'Processing'}
          </span>

          <span>
            {isFetching
              ? 'Updating...'
              : 'Auto-refreshing'}
          </span>
        </div>
      </div>
    </div>
  );
}