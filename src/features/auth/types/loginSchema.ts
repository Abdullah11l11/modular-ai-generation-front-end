import z from 'zod';
export const signSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'email is required' })
    .email({ message: 'not a valid email' }),
  password: z.string().min(1, { message: 'Password is required' }),
});
export type SignupSchema = z.infer<typeof signSchema>;
