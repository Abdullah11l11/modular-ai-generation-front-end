import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-background">
      <div className="w-full max-w-sm bg-card p-6 rounded-xl shadow-md border">
        <LoginForm />
      </div>
    </div>
  );
}
