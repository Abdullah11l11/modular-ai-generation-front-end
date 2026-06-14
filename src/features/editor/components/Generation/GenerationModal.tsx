import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGenerateProject } from '@/features/generation/hooks/useGenerateProject';
import { useGenerateFile } from '@/features/generation/hooks/useGenerateFile';
import { useAiProviders } from '@/features/me/hooks/useAiProviders';
import { useJobPoller } from '@/features/editor/hooks/useJobPoller';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Loader2Icon, SparklesIcon, ExternalLinkIcon } from 'lucide-react';
import { toastSuccess, toastError } from '@/lib/toast';
import type { Id, ProjectFile } from '@/types/api';

const LAYER_OPTIONS = [
  { value: 'slide', label: 'Slides' },
  { value: 'style', label: 'Style' },
  { value: 'layout', label: 'Layout' },
  { value: 'content', label: 'Content' },
  { value: 'context', label: 'Context' },
  { value: 'rules', label: 'Rules' },
  { value: 'meta', label: 'Meta' },
];

type GenerationModalInnerProps = {
  projectId: Id;
  onClose: () => void;
  initialFileId?: Id | null;
  contextContent?: string | null;
  files?: ProjectFile[];
};

function GenerationModalInner({
  projectId,
  onClose,
  initialFileId,
  contextContent,
  files,
}: GenerationModalInnerProps) {
  const queryClient = useQueryClient();
  const generateProject = useGenerateProject();
  const generateFile = useGenerateFile();
  const { data: providers, isLoading: providersLoading } = useAiProviders();

  const [prompt, setPrompt] = useState(contextContent ?? '');
  const [providerId, setProviderId] = useState(
    () => providers?.[0]?.id ?? '',
  );
  const [modelOverride, setModelOverride] = useState('');
  const [mode] = useState<'all' | 'layers'>(
    initialFileId ? 'layers' : 'all',
  );
  const [selectedLayers] = useState<Set<string>>(
    () => new Set(LAYER_OPTIONS.map((l) => l.value)),
  );
  const [currentJobId, setCurrentJobId] = useState<Id | null>(null);
  const [generating, setGenerating] = useState(false);
  const processedRef = useRef<Set<Id>>(new Set());

  const poller = useJobPoller(currentJobId);

  useEffect(() => {
    if (providers && providers.length > 0 && !providerId) {
      setProviderId(providers[0].id);
    }
  }, [providers, providerId]);

  useEffect(() => {
    const job = poller.data;
    if (!job || !currentJobId) return;
    if (processedRef.current.has(currentJobId)) return;

    if (job.status === 'succeeded') {
      processedRef.current.add(currentJobId);
      toastSuccess('Generation complete');
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'files'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'jobs'] });
      const t = setTimeout(() => {
        setGenerating(false);
        setCurrentJobId(null);
        onClose();
      }, 0);
      return () => clearTimeout(t);
    }

    if (job.status === 'failed') {
      processedRef.current.add(currentJobId);
      toastError(job.error ?? 'Generation failed. Please try again.');
      const t = setTimeout(() => setGenerating(false), 0);
      return () => clearTimeout(t);
    }
  }, [poller.data, currentJobId, projectId, queryClient, onClose]);

  const handleGenerate = async () => {
    if (!providerId) {
      toastError('Please select an AI provider.');
      return;
    }

    setGenerating(true);

    try {
      if (initialFileId || mode === 'layers') {
        const targetFileId = initialFileId ?? files?.[0]?.id;
        if (!targetFileId) {
          toastError('No file selected for generation.');
          setGenerating(false);
          return;
        }
        const job = await generateFile.mutateAsync({
          projectId,
          fileId: targetFileId,
          payload: {
            prompt: prompt || undefined,
            provider_id: providerId,
            model: modelOverride || undefined,
          },
        });
        setCurrentJobId(job.id);
      } else {
        const job = await generateProject.mutateAsync({
          projectId,
          payload: {
            prompt: prompt || undefined,
            provider_id: providerId,
            model: modelOverride || undefined,
          },
        });
        setCurrentJobId(job.id);
      }
    } catch {
      toastError('Failed to start generation. Please try again.');
      setGenerating(false);
    }
  };

  const isGenerating = generating || poller.isFetching;

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-(--cy)" />
          AI Generation
        </DialogTitle>
        <DialogDescription>
          {initialFileId
            ? 'Generate content for the selected layer'
            : 'Generate or enhance your project with AI'}
        </DialogDescription>
      </DialogHeader>

      {isGenerating && poller.data ? (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <Loader2Icon className="size-8 animate-spin text-(--cy)" />
          <p className="text-sm font-medium text-(--t1)">
            {poller.data.status === 'running' ? 'Generating...' : 'Starting...'}
          </p>
          <Badge
            className={`text-[11px] ${
              poller.data.status === 'running'
                ? 'bg-blue-500/10 text-blue-600'
                : 'bg-yellow-500/10 text-yellow-600'
            }`}
          >
            {poller.data.status}
          </Badge>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-[13px] font-medium text-(--t2)">Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to generate..."
              className="min-h-[100px] resize-y text-[13px]"
            />
          </div>

          {providersLoading ? (
            <div className="flex items-center gap-2 text-[13px] text-(--t3)">
              <Loader2Icon className="size-3.5 animate-spin" />
              Loading providers...
            </div>
          ) : !providers || providers.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-(--bor2) px-4 py-3 text-center">
              <p className="text-[13px] text-(--t3)">No AI providers configured.</p>
              <a
                href="/settings"
                className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-(--cy) hover:underline"
              >
                Configure in settings
                <ExternalLinkIcon className="size-3" />
              </a>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-(--t2)">Provider</label>
                <Select value={providerId} onValueChange={setProviderId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-[13px] font-medium text-(--t2)">
                  Model <span className="text-(--t3)">(optional)</span>
                </label>
                <Input
                  value={modelOverride}
                  onChange={(e) => setModelOverride(e.target.value)}
                  placeholder={providers?.[0]?.default_model ?? 'Model override'}
                  className="h-8 text-[13px]"
                />
              </div>
            </>
          )}

          {!initialFileId && (
            <div>
              <div className="mb-2 flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-[13px] font-medium text-(--t2)">
                  <input
                    type="radio"
                    name="gen-mode"
                    defaultChecked={mode === 'all'}
                    className="accent-(--cy)"
                  />
                  All Layers
                </label>
                <label className="flex items-center gap-1.5 text-[13px] font-medium text-(--t2)">
                  <input
                    type="radio"
                    name="gen-mode"
                    defaultChecked={mode === 'layers'}
                    className="accent-(--cy)"
                  />
                  Selected Layers
                </label>
              </div>

              {mode === 'layers' && (
                <div className="flex flex-wrap gap-2 rounded-lg border-2 border-(--bor2) p-2">
                  {LAYER_OPTIONS.map((layer) => (
                    <label
                      key={layer.value}
                      className="flex items-center gap-1.5 rounded-md bg-(--bg) px-2.5 py-1 text-[12px] font-medium text-(--t2) cursor-pointer has-checked:bg-(--cy-d) has-checked:text-(--cy)"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={selectedLayers.has(layer.value)}
                        className="accent-(--cy)"
                      />
                      {layer.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={handleGenerate}
              disabled={isGenerating || !providerId}
            >
              {isGenerating && <Loader2Icon className="size-3.5 animate-spin" />}
              {initialFileId ? 'Generate Layer' : 'Generate'}
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  );
}

type GenerationModalProps = {
  projectId: Id;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId?: Id | null;
  contextContent?: string | null;
  files?: ProjectFile[];
};

export function GenerationModal({
  projectId,
  open,
  onOpenChange,
  fileId,
  contextContent,
  files,
}: GenerationModalProps) {
  const openCountRef = useRef(0);
  const prevOpenRef = useRef(open);

  if (open && !prevOpenRef.current) {
    openCountRef.current++;
  }
  prevOpenRef.current = open;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <GenerationModalInner
          key={`gen-${openCountRef.current}-${fileId ?? 'all'}`}
          projectId={projectId}
          onClose={() => onOpenChange(false)}
          initialFileId={fileId}
          contextContent={contextContent}
          files={files}
        />
      )}
    </Dialog>
  );
}
