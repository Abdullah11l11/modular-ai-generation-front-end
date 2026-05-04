import { PageHeader } from '@/components/ui/PageHeader'
import { AuthForm } from '@/features/auth/components/AuthForm'

export function LoginPage() {
  return (
    <>
      <PageHeader title="Login" description="Access your MGF workspace." />
      <AuthForm mode="login" />
    </>
  )
}
