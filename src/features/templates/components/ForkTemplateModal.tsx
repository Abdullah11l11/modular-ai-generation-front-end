import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForkTemplate } from '@/features/templates/hooks/useForkTemplate';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Template } from '@/types/api';

type ForkTemplateModalProps = {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const MAX_NAME = 80;

export function ForkTemplateModal({ template, open, onOpenChange }: ForkTemplateModalProps) {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fork = useForkTemplate();

  useEffect(() => {
    if (open && template) {
      setName(`${template.name} (copy)`);
    }
  }, [open, template]);

  const trimmed = name.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= MAX_NAME;

  const handleSubmit = () => {
    if (!template || !isValid) return;
    fork.mutate(
      { templateId: template.id, payload: { name: trimmed } },
      {
        onSuccess: (response) => {
          // response shape depends on Task 1 fix — should contain new project id
          const newProjectId =
            (response as { project?: { id: string } }).project?.id ??
            (response as { id?: string }).id ??
            '';
          toastSuccess(`Created "${trimmed}"`);
          queryClient.invalidateQueries({ queryKey: ['projects'] });
          queryClient.invalidateQueries({ queryKey: ['templates'] });
          queryClient.invalidateQueries({ queryKey: ['templates', template.id, 'files'] });
          onOpenChange(false);
          if (newProjectId) navigate(`/editor/projects/${newProjectId}`);
        },
        onError: (err: unknown) => {
          const status = (err as { status?: number })?.status;
          if (status === 401) {
            toastError('Sign in to fork templates');
            navigate(`/login?next=/templates/${template.id}`);
            onOpenChange(false);
          } else {
            toastError('Could not create project — try again');
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Use this template</DialogTitle>
          <DialogDescription>
            {template?.name ?? 'This template'} will be copied to a new project you can edit.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor="fork-name" className="text-xs font-medium text-[var(--t2)]">
            Project name
          </label>
          <Input
            id="fork-name"
            value={name}
            maxLength={MAX_NAME}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isValid) handleSubmit();
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={fork.isPending}>
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={handleSubmit}
            disabled={!isValid || fork.isPending}
          >
            {fork.isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
            Create & open editor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}