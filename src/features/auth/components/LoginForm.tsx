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
      className={cn("flex flex-col gap-6 text-foreground", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email:</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            className="bg-input border border-border text-foreground ;
"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          )}
        </Field>

        <Field>
          <div
            className="flex items-center justify-between ;
"
          >
            <FieldLabel htmlFor="password">Password:</FieldLabel>
          </div>

          <Input
            id="password"
            type="password"
            className="bg-input border border-border text-foreground"
            {...register("password")}
          />

          {errors.password && (
            <p className="text-destructive text-sm">
              {errors.password.message}
            </p>
          )}
        </Field>

        <Field>
          <Button type="submit" className="bg-primary text-primary-foreground ">
            Login
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center text-muted-foreground">
            Don't have an account?{" "}
            <a className="underline underline-offset-4 hover:text-accent-foreground">
              Sign up
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
