import { PageHeader } from '@/components/ui/PageHeader'
import { AuthForm } from '@/features/auth/components/AuthForm'

export function RegisterPage() {
  return (
    <>
      <PageHeader title="Register" description="Create an MGF account." />
      <AuthForm mode="register" />
    </>
  )
}
