import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signSchema } from "@/features/auth/types/loginSchema";
import type { SignupSchema } from "@/features/auth/types/loginSchema";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<SignupSchema>({
    mode: "onChange",
    resolver: zodResolver(signSchema),
  });

  const onSubmit = (data: SignupSchema) => {
    console.log(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6 text-[var(--t1)]", className)}
      {...props}
    >
      <FieldGroup className="space-y-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-[26px] font-extrabold tracking-[-0.02em] text-[var(--t1)]">
            Login to your account
          </h1>
          <p className="text-[13px] text-[var(--t2)]">
            Enter your email below to login to your account
          </p>
        </div>
        <Field className="space-y-1.5">
          <FieldLabel
            htmlFor="email"
            className="text-[13px] font-medium text-[var(--t1)]"
          >
            Email:
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-destructive text-xs mt-1">
              {errors.email.message}
            </p>
          )}
        </Field>

        <Field className="space-y-1.5">
          <div className="flex items-center justify-between">
            <FieldLabel
              htmlFor="password"
              className="text-[13px] font-medium text-[var(--t1)]"
            >
              Password:
            </FieldLabel>

            <a
              href="#forgot"
              className="text-xs text-[var(--t2)] hover:text-[var(--cy)] transition-colors"
            >
              Forgot password?
            </a>
          </div>

          <Input id="password" type="password" {...register("password")} />

          {errors.password && (
            <p className="text-destructive text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </Field>

        <Field className="pt-2">
          <Button
            type="submit"
            className="w-full h-9 rounded-[var(--r8,8px)] bg-[var(--acc)] text-[var(--bg)] border border-[var(--bor2)] text-[13px] font-medium hover:opacity-85 transition-opacity"
          >
            Sign in
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center text-[13px] text-[var(--t2)]">
            No account?{" "}
            <a className="underline underline-offset-4 text-[var(--t1)] hover:text-[var(--cy)] cursor-pointer transition-colors">
              Create account
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
