import { PageHeader } from '@/components/ui/PageHeader'
import { DashboardSummary } from '@/features/projects/components/DashboardSummary'

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Manage personal projects and continue editing forked templates."
      />
      <DashboardSummary />
    </>
  )
}
