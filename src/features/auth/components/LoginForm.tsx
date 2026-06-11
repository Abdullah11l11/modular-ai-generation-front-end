import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signSchema } from '@/features/auth/types/loginSchema';
import type { SignupSchema } from '@/features/auth/types/loginSchema';
import { useLogin } from '@/features/auth/hooks/useLogin';

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const loginMutation = useLogin();

  const onSubmit = (data: SignupSchema) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<SignupSchema>({
    mode: 'onChange',
    resolver: zodResolver(signSchema),
  });
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('flex flex-col gap-[24px] text-[var(--t1)] p-6 md:p-8', className)}
      {...props}
    >
      <FieldGroup className="space-y-[15px]">
        <div className="flex flex-col items-center gap-1 text-center mb-2">
          <h1 className="text-[26px] font-extrabold tracking-[-0.02em] text-[var(--t1)] font-sans">
            Login to your account
          </h1>
          <p className="text-[13px] text-[var(--t2)] font-sans">
            Enter your email below to login to your account
          </p>
        </div>

        <Field className="space-y-1.5">
          <FieldLabel
            htmlFor="email"
            className="text-[13px] font-medium text-[var(--t1)] font-sans"
          >
            Email:
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            className="h-[32px] text-[13-13.5px] rounded-[var(--r8,8px)] border-[2px] border-[var(--cy)] bg-[var(--sur)] text-[var(--t1)] focus:border-[var(--cy)] transition-colors duration-150"
            {...register('email')}
          />
          {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
        </Field>
        <Field className="space-y-1.5">
          <div className="flex items-center justify-between">
            <FieldLabel
              htmlFor="password"
              className="text-[13px] font-medium text-[var(--t1)] font-sans"
            >
              Password:
            </FieldLabel>
          </div>

          <Input
            id="password"
            type="password"
            className="h-[32px] text-[13-13.5px] rounded-[var(--r8,8px)] border-[2px] border-[var(--cy)] bg-[var(--sur)] text-[var(--t1)] focus:border-[var(--cy)] transition-colors duration-150"
            {...register('password')}
          />

          {errors.password && (
            <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
          )}
        </Field>

        <Field className="pt-2">
          <Button
            type="submit"
            className="w-full h-9 rounded-[var(--r8,8px)] bg-[var(--acc)] text-[var(--bg)] border border-[var(--bor2)] text-[13px] font-semibold hover:opacity-85 transition-opacity duration-150"
          >
            Sign in
          </Button>
        </Field>

        <FieldDescription className="text-center text-[13px] text-[var(--t2)] font-sans">
          No account?{' '}
          <Link
            to="/register"
            target="_blank"
            className="underline underline-offset-4 hover:text-[var(--cy)] text-[var(--t1)]  cursor-pointer transition-colors duration-150"
          >
            Create account
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
