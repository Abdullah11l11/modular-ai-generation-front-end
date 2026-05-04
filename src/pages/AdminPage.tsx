import { PageHeader } from '@/components/ui/PageHeader'
import { AdminOverview } from '@/features/admin/components/AdminOverview'

export function AdminPage() {
  return (
    <>
      <PageHeader
        title="Admin"
        description="Moderation and platform management placeholders."
      />
      <AdminOverview />
    </>
  )
}
