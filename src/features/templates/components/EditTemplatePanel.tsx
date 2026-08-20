import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagInput } from '@/components/ui/tag-input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { useUpdateTemplate } from '@/features/templates/hooks/useUpdateTemplate';
import { useTypes } from '@/features/types/hooks/useTypes';
import type { Template, Direction, Visibility } from '@/types/api';
import { ApiError } from '@/lib/api/client';

type FormValues = {
  name: string;
  description: string;
  visibility: Visibility;
  type_id: string;
  direction: Direction;
  tags: string[];
};

type EditTemplatePanelProps = {
  template: Template;
  onSaved: () => void;
};

export function EditTemplatePanel({ template, onSaved }: EditTemplatePanelProps) {
  const { data: types } = useTypes();
  const { mutate, isPending, error: mutationError } = useUpdateTemplate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: template.name,
      description: template.description ?? '',
      visibility: template.visibility,
      type_id: template.type?.id ?? '',
      direction: template.direction,
      tags: template.tags,
    },
  });

  const watchTags = watch('tags');

  function onSubmit(data: FormValues) {
    mutate(
      {
        templateId: template.id,
        payload: {
          name: data.name,
          description: data.description || null,
          visibility: data.visibility,
          type_id: data.type_id,
          direction: data.direction,
          tags: data.tags,
        },
      },
      {
        onSuccess: () => onSaved(),
        onError: (err) => {
          if (err instanceof ApiError && err.status === 422) {
            const details = err.details as Record<string, string[]>;
            if (details?.errors) {
              for (const [field, messages] of Object.entries(details.errors)) {
                setError(field as keyof FormValues, {
                  message: Array.isArray(messages) ? messages[0] : messages,
                });
              }
            }
          }
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea id="description" {...register('description')} className="min-h-20 resize-none" />
        </Field>

        <Field>
          <FieldLabel htmlFor="type">Type</FieldLabel>
          <Select
            value={watch('type_id')}
            onValueChange={(val) => setValue('type_id', val, { shouldValidate: true })}
          >
            <SelectTrigger id="type" className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {types?.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="visibility">Visibility</FieldLabel>
          <Select
            value={watch('visibility')}
            onValueChange={(val) => setValue('visibility', val as Visibility, { shouldValidate: true })}
          >
            <SelectTrigger id="visibility" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="unlisted">Unlisted</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="direction">Direction</FieldLabel>
          <Select
            value={watch('direction')}
            onValueChange={(val) => setValue('direction', val as Direction, { shouldValidate: true })}
          >
            <SelectTrigger id="direction" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ltr">LTR</SelectItem>
              <SelectItem value="rtl">RTL</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="tags">Tags</FieldLabel>
          <TagInput
            id="tags"
            value={watchTags}
            onChange={(tags) => setValue('tags', tags)}
          />
        </Field>

        {mutationError && !(mutationError instanceof ApiError && mutationError.status === 422) && (
          <p className="text-xs text-destructive">{mutationError.message}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" variant="accent" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
