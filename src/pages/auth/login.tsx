import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-[var(--bg)]">
      <div className="w-full max-w-sm bg-[var(--sur)] p-6 rounded-[var(--radius-lg)] shadow-sm border border-[var(--bor2)]">
        <LoginForm />
      </div>
    </div>
  );
}
