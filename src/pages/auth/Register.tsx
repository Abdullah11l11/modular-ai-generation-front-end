import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-[var(--bg)]">
      <div className="w-full max-w-sm bg-[var(--sur)] p-6 rounded-[var(--radius-lg)] shadow-sm border border border-[var(--bor2)]">
        <RegisterForm />
      </div>
    </div>
  );
}
