import { z } from 'zod';

export const projectSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  visibility: z.enum(['public', 'private', 'unlisted']),
  tags: z.array(z.string()).optional(),
  direction: z.enum(['ltr', 'rtl']),
});

export type ProjectSettingsFormValues = z.infer<typeof projectSettingsSchema>;
