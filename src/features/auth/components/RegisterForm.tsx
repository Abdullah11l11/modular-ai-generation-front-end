import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterData } from '@/features/auth/types/registerSchema';
import { useRegister } from '../hooks/useRegister';
import { Link } from 'react-router-dom';

export function RegisterForm({ className, ...props }: React.ComponentProps<typeof Card>) {
  const registerMutation = useRegister();

  const onSubmit = (data: RegisterData) => {
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
    <Card className={cn('max-w-105 w-full', className)} {...props}>
      <CardHeader className="p-6 pb-4 flex flex-col gap-1 items-center text-center">
        <CardTitle className="text-[22px] font-extrabold tracking-[-0.02em] text-(--t1) font-sans">
          Create an account
        </CardTitle>
        <CardDescription className="text-[13px]">
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name:</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Alex Johnson"
                className="bg-(--sur2)"
                {...register('name')}
              />

              {errors.name && (
                <p className="text-xs text-destructive mt-1.5">{errors.name.message}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email:</FieldLabel>

              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                className="bg-(--sur2)"
                {...register('email')}
              />

              {errors.email && (
                <p className="text-xs text-destructive mt-1.5">{errors.email.message}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password:</FieldLabel>

              <Input
                id="password"
                type="password"
                className="bg-(--sur2)"
                {...register('password')}
              />

              {errors.password && (
                <p className="text-xs text-destructive mt-1.5">{errors.password.message}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm Password:</FieldLabel>

              <Input
                id="confirmPassword"
                type="password"
                className="bg-(--sur2)"
                {...register('confirmPassword')}
              />

              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1.5">{errors.confirmPassword.message}</p>
              )}
            </Field>
            <FieldDescription className="flex flex-col items-center gap-3">
              <Button
                type="submit"
                variant="accent"
                className="w-full h-9 text-[13px] font-semibold"
              >
                Create Account
              </Button>

              <p className="text-center">
                Already have an account?{' '}
                <Link to="/login" className="underline underline-offset-4 text-(--t1)">
                  Sign in
                </Link>
              </p>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
