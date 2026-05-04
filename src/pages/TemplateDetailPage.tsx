import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { TemplateDetail } from '@/features/templates/components/TemplateDetail'

export function TemplateDetailPage() {
  const { templateId = '' } = useParams()

  return (
    <>
      <PageHeader title="Template" description="Review and fork a template." />
      <TemplateDetail templateId={templateId} />
    </>
  )
}
