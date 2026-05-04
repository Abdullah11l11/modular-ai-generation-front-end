import { PageHeader } from '@/components/ui/PageHeader'
import { ResourceForm } from '@/features/resources/components/ResourceForm'

export function NewResourcePage() {
  return (
    <>
      <PageHeader title="New resource" description="Draft a community resource." />
      <ResourceForm />
    </>
  )
}
