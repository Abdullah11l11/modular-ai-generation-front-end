import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { ResourceDetail } from '@/features/resources/components/ResourceDetail'

export function ResourceDetailPage() {
  const { resourceId = '' } = useParams()

  return (
    <>
      <PageHeader title="Resource" description="Review and fork a resource." />
      <ResourceDetail resourceId={resourceId} />
    </>
  )
}
