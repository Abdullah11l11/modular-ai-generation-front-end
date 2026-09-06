import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateResource } from '@/features/resources/hooks/useCreateResource';
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
import type { ResourceKind, ResourcePlaceholder, Visibility } from '@/types/api';

const PLACEHOLDER_REGEX = /\{\{(\w+)\}\}/g;
const TEXTAREA_KEYS = new Set([
  'code',
  'snippet',
  'body',
  'content',
  'notes',
  'description',
  'examples',
  'template',
  'input',
  'output',
  'message',
  'prompt',
  'response',
  'query',
  'bullets',
  'request',
  'reply',
  'report',
]);

function humanizeKey(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferPlaceholderType(key: string): 'text' | 'textarea' {
  return TEXTAREA_KEYS.has(key.toLowerCase()) ? 'textarea' : 'text';
}

function extractPlaceholders(content: string): ResourcePlaceholder[] {
  const seen = new Set<string>();
  const out: ResourcePlaceholder[] = [];
  PLACEHOLDER_REGEX.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PLACEHOLDER_REGEX.exec(content)) !== null) {
    const key = m[1];
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      key,
      label: humanizeKey(key),
      default: '',
      type: inferPlaceholderType(key),
    });
  }
  return out;
}

const createResourceSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(120, 'Name must be 120 characters or fewer'),
  kind: z.enum(['prompt', 'skill', 'agent', 'rule', 'mcp', 'design_doc', 'hook'] as const),
  description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
  content: z.string().min(1, 'Content is required'),
  visibility: z.enum(['public', 'unlisted', 'private'] as const),
  tags: z.array(z.string()).max(20, 'At most 20 tags').optional(),
});

type CreateResourceFormValues = z.infer<typeof createResourceSchema>;

const KIND_OPTIONS: { value: ResourceKind; label: string; hint: string }[] = [
  { value: 'prompt', label: 'Prompt', hint: 'A reusable prompt template' },
  { value: 'skill', label: 'Skill', hint: 'A capability the AI can invoke' },
  { value: 'agent', label: 'Agent', hint: 'A complete agent definition' },
  { value: 'rule', label: 'Rule', hint: 'A behavior or guardrail' },
  { value: 'mcp', label: 'MCP', hint: 'An MCP server configuration' },
  { value: 'design_doc', label: 'Design Doc', hint: 'Background or specification' },
  { value: 'hook', label: 'Hook', hint: 'A lifecycle hook' },
];

type CreateResourceFormProps = {
  onSuccess?: () => void;
};

export function CreateResourceForm({ onSuccess }: CreateResourceFormProps) {
  const navigate = useNavigate();
  const createResource = useCreateResource();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateResourceFormValues>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: {
      name: '',
      kind: 'prompt',
      description: '',
      content: '',
      visibility: 'public',
      tags: [],
    },
  });

  const kind = useWatch({ control, name: 'kind' });
  const visibility = useWatch({ control, name: 'visibility' });
  const tags = useWatch({ control, name: 'tags' }) ?? [];
  const content = useWatch({ control, name: 'content' }) ?? '';
  const detectedPlaceholders = useMemo(() => extractPlaceholders(content), [content]);

  const onSubmit = async (data: CreateResourceFormValues) => {
    try {
      const resource = await createResource.mutateAsync({
        kind: data.kind,
        name: data.name,
        description: data.description?.trim() ? data.description : null,
        content: data.content,
        placeholders: detectedPlaceholders,
        visibility: data.visibility,
        tags: data.tags,
      });
      toastSuccess(`Resource "${resource.name}" created`);
      onSuccess?.();
      navigate(`/resources/${resource.id}`);
    } catch {
      toastError('Failed to create resource. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FieldGroup>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <FieldContent>
            <Input {...register('name')} placeholder="My prompt template" autoFocus />
            <FieldError errors={errors.name && [{ message: errors.name.message }]} />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel>Kind</FieldLabel>
            <FieldContent>
              <Select
                value={kind}
                onValueChange={(v) => setValue('kind', v as ResourceKind, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KIND_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-(--t3)">
                {KIND_OPTIONS.find((o) => o.value === kind)?.hint}
              </p>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Visibility</FieldLabel>
            <FieldContent>
              <Select
                value={visibility}
                onValueChange={(v) => setValue('visibility', v as Visibility)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public — anyone can see it</SelectItem>
                  <SelectItem value="unlisted">Unlisted — only people with the link</SelectItem>
                  <SelectItem value="private">Private — only you</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel>Description</FieldLabel>
          <FieldContent>
            <Textarea
              {...register('description')}
              placeholder="What does this resource do? When should someone reach for it?"
              rows={2}
            />
            <FieldError errors={errors.description && [{ message: errors.description.message }]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Content</FieldLabel>
          <FieldContent>
            <Textarea
              {...register('content')}
              placeholder="Paste or write the resource content. Use {{placeholder}} for variables."
              rows={10}
              className="font-mono text-xs"
            />
            <p className="text-xs text-(--t3)">
              {detectedPlaceholders.length === 0
                ? 'No {{placeholder}} variables detected yet.'
                : `Detected ${detectedPlaceholders.length} placeholder${
                    detectedPlaceholders.length === 1 ? '' : 's'
                  }: ${detectedPlaceholders.map((p) => `{{${p.key}}}`).join(', ')}`}
            </p>
            <FieldError errors={errors.content && [{ message: errors.content.message }]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Tags</FieldLabel>
          <FieldContent>
            <TagInput
              value={tags}
              onChange={(next) => setValue('tags', next, { shouldValidate: true })}
              placeholder="Press Enter to add"
            />
            <FieldError errors={errors.tags && [{ message: errors.tags.message }]} />
          </FieldContent>
        </Field>
      </FieldGroup>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/resources')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="size-3.5 animate-spin" />}
          Create resource
        </Button>
      </div>
    </form>
  );
}
