import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/features/auth/types/loginSchema';
import type { LoginSchema } from '@/features/auth/types/loginSchema';
import { useLogin } from '@/features/auth/hooks/useLogin';

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const { mutate, isPending, isError, error } = useLogin();

  const onSubmit = (data: LoginSchema) => {
    mutate({
      email: data.email,
      password: data.password,
    });
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginSchema>({
    mode: 'onChange',
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="bg-(--sur) rounded-(--r12,12px) text-(--t1) shadow-sm p-6 md:p-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn('flex flex-col gap-6 text-(--t1)', className)}
        {...props}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-0.75 text-center mb-4">
            <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-(--t1) font-sans">
              Login to your account
            </h1>
            <p className="text-[13px] text-(--t2) font-sans">
              Enter your email below to login to your account
            </p>
          </div>

          <Field>
            <FieldLabel htmlFor="email">Email:</FieldLabel>
            <Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
            {errors.email && (
              <p className="text-destructive text-xs mt-1.5">{errors.email.message}</p>
            )}
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password:</FieldLabel>
            </div>

            <Input id="password" type="password" {...register('password')} />

            {errors.password && (
              <p className="text-destructive text-xs mt-1.5">{errors.password.message}</p>
            )}
          </Field>

          {isError && <p className="text-red-500 text-xs">{error?.message || 'Login failed'}</p>}

          <Field>
            <Button
              disabled={isPending}
              type="submit"
              variant="accent"
              className="w-full h-9 text-[13px] font-semibold"
            >
              {isPending ? 'Loading...' : 'Sign in'}
            </Button>
          </Field>

          <FieldDescription className="text-center">
            No account?{' '}
            <Link
              to="/register"
              className="underline underline-offset-4 hover:text-(--cy) text-(--t1)"
            >
              Create account
            </Link>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}
