import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '@/features/projects/hooks/useCreateProject';
import { createProjectFile } from '@/features/files/api/createProjectFile';
import { useTypes } from '@/features/types/hooks/useTypes';
import { TypePicker } from '@/features/types/components/TypePicker';
import { SizeSelector } from '@/features/types/components/SizeSelector';
import { getOutputTypeInfo } from '@/features/types/types/outputTypeMap';
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
      size: undefined,
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
  const selectedSize = useWatch({ control, name: 'size' });

  const selectedType = types?.find((t) => t.id === typeId);
  const selectedInfo = getOutputTypeInfo(selectedType?.name);

  const handleTypeChange = (id: string) => {
    setValue('type_id', id);
    const info = getOutputTypeInfo(types?.find((t) => t.id === id)?.name);
    setValue('size', info.defaultSize);
  };

  const onSubmit = async (data: CreateProjectFormValues) => {
    try {
      const project = await createProject.mutateAsync({
        name: data.name,
        type_id: data.type_id,
        description: data.description,
        visibility: data.visibility,
        tags: data.tags,
        direction: data.direction,
      });

      // Persist the chosen size to the project's meta.json file. The
      // size isn't a backend project field, so we store it on the
      // `meta` file layer (frontend-only) and read it back in the
      // editor preview + export defaults. Fire-and-forget: navigation
      // proceeds regardless, and the editor falls back to the type
      // default if this write is missing/fails.
      if (data.size) {
        void createProjectFile(project.id, {
          layer: 'meta',
          name: 'meta.json',
          extension: 'json',
          content: JSON.stringify({ size: data.size }, null, 2),
        });
      }

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
            <TypePicker
              types={types}
              value={typeId}
              onValueChange={handleTypeChange}
              loading={typesLoading}
            />
            {selectedType && (
              <SizeSelector
                sizes={selectedInfo.allowedSizes}
                value={selectedSize ?? selectedInfo.defaultSize}
                onChange={(size) => setValue('size', size)}
              />
            )}
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
