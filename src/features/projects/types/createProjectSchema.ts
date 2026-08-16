import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type_id: z.string().min(1, 'Type is required'),
  description: z.string().optional(),
  visibility: z.enum(['public', 'private', 'unlisted']).optional(),
  tags: z.array(z.string()).optional(),
  direction: z.enum(['ltr', 'rtl']).optional(),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
