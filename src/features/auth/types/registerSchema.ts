import z from 'zod';
export const registerSchema = z
  .object({
    Name: z.string().min(1, { message: 'Name is required' }),
    email: z
      .string()
      .min(1, { message: 'email is required' })
      .email({ message: 'not a valid email' }),
    password: z
      .string()
      .min(8, { message: 'password must be at least 8 characters' })
      .max(20, { message: 'password must be at most 20 characters' }),
    confirmPassword: z.string().min(1, { message: 'confirmPassword is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'password do not match',
    path: ['confirmPassword'],
  });

export type Signup = z.infer<typeof registerSchema>;
