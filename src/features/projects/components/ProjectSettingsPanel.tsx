import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProject } from '@/features/projects/hooks/useProject';
import { useUpdateProject } from '@/features/projects/hooks/useUpdateProject';
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldContent,
  FieldError,
  FieldDescription,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
import { TagInput } from '@/components/ui/tag-input';
import { Loader2Icon } from 'lucide-react';
import type { Id } from '@/types/api';

const settingsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  visibility: z.enum(['public', 'private', 'unlisted']),
  tags: z.array(z.string()).optional(),
  direction: z.enum(['ltr', 'rtl']),
});

type FormValues = z.infer<typeof settingsSchema>;

type ProjectSettingsPanelProps = {
  projectId: Id;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProjectSettingsPanel({ projectId, open, onOpenChange }: ProjectSettingsPanelProps) {
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const updateProject = useUpdateProject();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'draft',
      visibility: 'private',
      tags: [],
      direction: 'ltr',
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description ?? '',
        status: project.status,
        visibility: project.visibility,
        tags: project.tags,
        direction: project.direction,
      });
    }
  }, [project, reset]);

  const tags = useWatch({ control, name: 'tags' }) ?? [];
  const currentStatus = useWatch({ control, name: 'status' });
  const visibility = useWatch({ control, name: 'visibility' });
  const direction = useWatch({ control, name: 'direction' });

  const onSubmit = async (data: FormValues) => {
    await updateProject.mutateAsync(
      { projectId, payload: { ...data, description: data.description || null } },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  if (projectLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project Settings</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="size-5 animate-spin text-(--t3)" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!project) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project Settings</DialogTitle>
            <DialogDescription>Project not found.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const statusNote =
    currentStatus === 'published' && project.status === 'draft'
      ? 'Published projects are visible to others.'
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Edit metadata for <span className="font-medium text-(--t1)">{project.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <FieldGroup>
            <Field>
              <FieldLabel>Type</FieldLabel>
              <FieldContent>
                <Input value={project.type?.name ?? '—'} disabled className="text-(--t2)" />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Name</FieldLabel>
              <FieldContent>
                <Input {...register('name')} placeholder="My project" />
                <FieldError errors={errors.name && [{ message: errors.name.message }]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <FieldContent>
                <Textarea {...register('description')} placeholder="Optional description" />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Status</FieldLabel>
              <FieldContent>
                <Select
                  value={currentStatus}
                  onValueChange={(v) => setValue('status', v as FormValues['status'])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                {statusNote && <FieldDescription>{statusNote}</FieldDescription>}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Visibility</FieldLabel>
              <FieldContent>
                <Select
                  value={visibility}
                  onValueChange={(v) => setValue('visibility', v as FormValues['visibility'])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Direction</FieldLabel>
              <FieldContent>
                <Select
                  value={direction}
                  onValueChange={(v) => setValue('direction', v as FormValues['direction'])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ltr">LTR</SelectItem>
                    <SelectItem value="rtl">RTL</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Tags</FieldLabel>
              <FieldContent>
                <TagInput
                  value={tags}
                  onChange={(v) => setValue('tags', v)}
                  placeholder="Add tag and press Enter"
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={isSubmitting || !isDirty}>
              {isSubmitting && <Loader2Icon className="size-3.5 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
