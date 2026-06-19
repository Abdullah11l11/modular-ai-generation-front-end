import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SparklesIcon, Loader2Icon, CheckCircle2Icon, XCircleIcon, ExternalLinkIcon } from 'lucide-react';
import { useAiProviders } from '@/features/me/hooks/useAiProviders';
import { useGenerateProject } from '@/features/generation/hooks/useGenerateProject';
import { useGenerateFile } from '@/features/generation/hooks/useGenerateFile';
import { useJobPoller } from '@/features/editor/hooks/useJobPoller';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toastSuccess, toastError } from '@/lib/toast';
import type { Id, ProjectFile, ProjectFileKind } from '@/types/api';

type GenerationModalProps = {
  projectId: Id;
  fileId?: Id;
  stem?: string;
  files: ProjectFile[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ALL_LAYER_KINDS: ProjectFileKind[] = ['slide', 'style', 'content'];

export function GenerationModal({ projectId, fileId, stem, files, open, onOpenChange }: GenerationModalProps) {
  const queryClient = useQueryClient();
  const { data: providers = [], isLoading: providersLoading } = useAiProviders();
  const generateProject = useGenerateProject();
  const generateFile = useGenerateFile();

  const [prompt, setPrompt] = useState('');
  const [providerId, setProviderId] = useState('');
  const [model, setModel] = useState('');
  const [mode, setMode] = useState<'all' | 'selected'>('all');
  const [selectedLayers, setSelectedLayers] = useState<ProjectFileKind[]>(['slide', 'style', 'content']);
  const [activeJobId, setActiveJobId] = useState<Id | null>(null);

  const { data: jobData, isFetching: jobFetching } = useJobPoller(activeJobId);
  const isGenerating = !!activeJobId && (jobFetching || (jobData && !['succeeded', 'failed'].includes(jobData.status)));

  const isPerFile = !!fileId;

  const firstProvider = useMemo(() => providers[0], [providers]);

  useEffect(() => {
    if (firstProvider && !providerId) {
      setProviderId(firstProvider.id);
      setModel(firstProvider.default_model ?? '');
    }
  }, [firstProvider, providerId]);

  useEffect(() => {
    if (!open) {
      setPrompt('');
      setModel(providers.find((p) => p.id === providerId)?.default_model ?? '');
      setMode('all');
      setSelectedLayers(['slide', 'style', 'content']);
      setActiveJobId(null);
    }
  }, [open, providerId, providers]);

  const invalidateFiles = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'files'] });
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'jobs'] });
  }, [queryClient, projectId]);

  useEffect(() => {
    if (jobData?.status === 'succeeded') {
      toastSuccess('Generation complete');
      invalidateFiles();
      setTimeout(() => onOpenChange(false), 800);
    } else if (jobData?.status === 'failed') {
      toastError(jobData.error ?? 'Generation failed');
    }
  }, [jobData, invalidateFiles, onOpenChange]);

  async function handleGenerate() {
    if (!providerId) return;

    const payload = { prompt: prompt || undefined, provider_id: providerId, model: model || undefined };

    try {
      if (isPerFile && fileId) {
        const job = await generateFile.mutateAsync({ projectId, fileId, payload });
        setActiveJobId(job.id);
      } else if (mode === 'selected') {
        const targetFiles = files.filter((f) => selectedLayers.includes(f.layer));
        if (targetFiles.length === 0) {
          toastError('No files match the selected layers');
          return;
        }
        const results = await Promise.all(
          targetFiles.map((f) =>
            generateFile.mutateAsync({ projectId, fileId: f.id, payload })
              .catch(() => null),
          ),
        );
        const firstJob = results.find((r): r is NonNullable<typeof r> => r !== null);
        if (firstJob) setActiveJobId(firstJob.id);
        if (results.some((r) => r !== null)) {
          toastSuccess('Generation started');
        } else {
          toastError('Failed to start generation');
        }
      } else {
        const job = await generateProject.mutateAsync({ projectId, payload });
        setActiveJobId(job.id);
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Generation failed');
    }
  }

  const mutationPending = generateProject.isPending || generateFile.isPending;
  const canGenerate = !!providerId && !mutationPending && !isGenerating;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!isGenerating) onOpenChange(next); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SparklesIcon className="size-4" />
            {isPerFile ? `Generate — ${stem ?? fileId}` : 'AI Generation'}
          </DialogTitle>
          <DialogDescription>
            {isPerFile
              ? 'Generate content for the selected file.'
              : 'Generate content for your entire project or selected layers.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {providers.length === 0 && !providersLoading ? (
            <div className="flex flex-col items-center gap-2 rounded-md border border-(--bor2) p-4 text-center">
              <p className="text-xs text-(--t3)">No AI providers configured.</p>
              <Button variant="accent" size="sm" asChild>
                <a href="/settings">
                  <ExternalLinkIcon className="size-3" />
                  Go to Settings
                </a>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-(--t2)">Prompt</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to generate..."
                  className="min-h-[72px] resize-none text-xs"
                  disabled={isGenerating}
                />
              </div>

              <div className="flex gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-xs text-(--t2)">Provider</label>
                  <Select
                    value={providerId}
                    onValueChange={(v) => {
                      setProviderId(v);
                      const p = providers.find((pr) => pr.id === v);
                      if (p) setModel(p.default_model ?? '');
                    }}
                    disabled={isGenerating}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-xs text-(--t2)">Model</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Override model"
                    className="h-7 rounded-md border border-(--bor2) bg-(--bg) px-2 text-xs text-(--t1) outline-none focus:border-(--cy)"
                    disabled={isGenerating}
                  />
                </div>
              </div>

              {!isPerFile && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-(--t2)">Scope</label>

                  <div className="flex gap-1.5">
                    {(['all', 'selected'] as const).map((opt) => (
                      <Button
                        key={opt}
                        variant={mode === opt ? 'accent' : 'outline'}
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setMode(opt)}
                        disabled={isGenerating}
                      >
                        {opt === 'all' ? 'All Layers' : 'Selected Layers'}
                      </Button>
                    ))}
                  </div>

                  {mode === 'selected' && (
                    <div className="flex gap-2">
                      {ALL_LAYER_KINDS.map((layer) => {
                        const isChecked = selectedLayers.includes(layer);
                        return (
                          <label
                            key={layer}
                            className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                              isChecked
                                ? 'border-(--cy) bg-(--cy-d) text-(--t1)'
                                : 'border-(--bor2) text-(--t3) hover:border-(--bor)'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedLayers((prev) =>
                                  isChecked ? prev.filter((l) => l !== layer) : [...prev, layer],
                                );
                              }}
                              className="sr-only"
                              disabled={isGenerating}
                            />
                            {layer.toUpperCase()}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="accent"
                size="sm"
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full"
              >
                {mutationPending || isGenerating ? (
                  <>
                    <Loader2Icon className="size-3.5 animate-spin" />
                    {mutationPending ? 'Starting...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <SparklesIcon className="size-3.5" />
                    Generate
                  </>
                )}
              </Button>

              {isGenerating && jobData && (
                <div className="flex items-center justify-between rounded-md border border-(--bor2) bg-(--bg) px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2Icon className="size-3.5 animate-spin text-(--cy)" />
                    <span className="text-xs text-(--t2)">Generating...</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      jobData.status === 'queued'
                        ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
                        : 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    {jobData.status === 'queued' ? 'Queued' : 'Running'}
                  </Badge>
                </div>
              )}

              {jobData?.status === 'failed' && (
                <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
                  <XCircleIcon className="size-3.5 shrink-0 text-red-400" />
                  <span className="text-xs text-red-300">{jobData.error ?? 'Generation failed'}</span>
                </div>
              )}

              {jobData?.status === 'succeeded' && (
                <div className="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2">
                  <CheckCircle2Icon className="size-3.5 shrink-0 text-green-400" />
                  <span className="text-xs text-green-300">Generation completed successfully</span>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
