import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '@/features/projects/hooks/useCreateProject';
import { useTypes } from '@/features/types/hooks/useTypes';
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from '@/features/projects/types/createProjectSchema';
import { Field, FieldLabel, FieldGroup, FieldContent, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from '@/components/ui/tag-input';
import { toastSuccess, toastError } from '@/lib/toast';
import { Loader2Icon } from 'lucide-react';

type CreateProjectFormProps = {
  onSuccess?: () => void;
};

export function CreateProjectForm({ onSuccess }: CreateProjectFormProps) {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const { data: types, isLoading: typesLoading } = useTypes();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      type_id: '',
      description: '',
      visibility: 'private',
      tags: [],
      direction: 'ltr',
    },
  });

  const tags = useWatch({ control, name: 'tags' }) ?? [];
  const typeId = useWatch({ control, name: 'type_id' });
  const visibility = useWatch({ control, name: 'visibility' });
  const direction = useWatch({ control, name: 'direction' });

  const onSubmit = async (data: CreateProjectFormValues) => {
    try {
      const project = await createProject.mutateAsync(data);
      toastSuccess(`Project "${project.name}" created`);
      onSuccess?.();
      navigate(`/editor/projects/${project.id}`);
    } catch {
      toastError('Failed to create project. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FieldGroup>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <FieldContent>
            <Input {...register('name')} placeholder="My project" />
            <FieldError errors={errors.name && [{ message: errors.name.message }]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Type</FieldLabel>
          <FieldContent>
            <Select value={typeId} onValueChange={(v) => setValue('type_id', v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={typesLoading ? 'Loading...' : 'Select type'} />
              </SelectTrigger>
              <SelectContent>
                {types?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={errors.type_id && [{ message: errors.type_id.message }]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Description</FieldLabel>
          <FieldContent>
            <Textarea {...register('description')} placeholder="Optional description" />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Visibility</FieldLabel>
          <FieldContent>
            <Select
              value={visibility ?? 'private'}
              onValueChange={(v) => setValue('visibility', v as CreateProjectFormValues['visibility'])}
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
              value={direction ?? 'ltr'}
              onValueChange={(v) => setValue('direction', v as CreateProjectFormValues['direction'])}
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
        <Button type="submit" variant="accent" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="size-3.5 animate-spin" />}
          Create project
        </Button>
      </div>
    </form>
  );
}
