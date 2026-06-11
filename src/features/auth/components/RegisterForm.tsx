import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterData } from '@/features/auth/types/registerSchema';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { Link } from 'react-router-dom';

export function RegisterForm({ className, ...props }: React.ComponentProps<typeof Card>) {
  const registerMutation = useRegister();

  const onSubmit = (data: RegisterData) => {
    console.log('SUBMIT WORKED!', data);
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      password_confirmation: data.confirmPassword,
    });
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<RegisterData>({
    mode: 'onChange',
    resolver: zodResolver(registerSchema),
  });

  return (
    <Card
      className={cn(
        'rounded-[var(--r12,12px)] bg-[var(--sur)] text-[var(--t1)] shadow-sm max-w-[420px] w-full',
        className,
      )}
      {...props}
    >
      <CardHeader className="p-6 pb-4 flex flex-col gap-1 items-center text-center">
        <CardTitle className="text-[22px] font-extrabold tracking-[-0.02em] text-[var(--t1)] font-sans ">
          Create an account
        </CardTitle>
        <CardDescription className="text-[13px] text-[var(--t2)] font-sans">
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-[10px] border-none p-0 m-0">
            <Field className="space-y-1 border-none p-0">
              <FieldLabel
                htmlFor="Name"
                className="text-[13px] font-medium text-[var(--t1)] font-sans"
              >
                Full Name:
              </FieldLabel>
              <Input
                id="Name"
                type="text"
                placeholder="Alex Johnson"
                className="h-[32px] text-[13px]  rounded-[var(--r8,8px)] border-[2px] border-[var(--cy)] bg-[var(--sur2)] text-[var(--t1)] focus:border-[var(--cy)] transition-colors duration-150"
                {...register('name')}
              />

              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
              )}
            </Field>
            <Field className="space-y-1 border-none p-0">
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
                className="h-[32px] text-[13px] border-[2px] border-[var(--cy)] rounded-[var(--r8,8px)]  bg-[var(--sur2)] text-[var(--t1)] focus:border-[var(--cy)] transition-colors duration-150"
                {...register('email')}
              />

              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </Field>
            <Field className="space-y-1 border-none p-0">
              <FieldLabel
                htmlFor="password"
                className="text-[13px] font-medium text-[var(--t1)] font-sans"
              >
                Password:
              </FieldLabel>

              <Input
                id="password"
                type="password"
                className="h-[32px] text-[13px] border-[2px] border-[var(--cy)] rounded-[var(--r8,8px)]  bg-[var(--sur2)] text-[var(--t1)] focus:border-[var(--cy)] transition-colors duration-150"
                {...register('password')}
              />

              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </Field>
            <Field className="space-y-1 border-none p-0">
              <FieldLabel
                htmlFor="confirmPassword"
                className="text-[13px] font-medium text-[var(--t1)] font-sans"
              >
                Confirm Password:
              </FieldLabel>

              <Input
                id="confirmPassword"
                type="password"
                className="h-[32px] text-[13px] border-[2px] border-[var(--cy)] rounded-[var(--r8,8px)]  bg-[var(--sur2)] text-[var(--t1)] focus:border-[var(--cy)] transition-colors duration-150"
                {...register('confirmPassword')}
              />

              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
              )}
            </Field>

            <Field className="pt-2 border-none p-0 mt-3">
              <Button
                type="submit"
                className="w-full h-9 rounded-[var(--r8,8px)] bg-[var(--acc)] text-[var(--bg)] border border-[var(--bor2)] text-[13px] font-semibold hover:opacity-85 transition-opacity duration-150"
              >
                Create Account{' '}
              </Button>
            </Field>
            <FieldDescription className=" mt-4 text-center text-[13px] text-[var(--t2)] font-sans ">
              Already have an account?{' '}
              <Link
                to="/login"
                className="underline underline-offset-4  text-[var(--t1)]   cursor-pointer transition-colors duration-150"
              >
                Sign in
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
