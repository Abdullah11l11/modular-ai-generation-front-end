import { PlaceholderPanel } from '@/components/ui/PlaceholderPanel'
import { useTemplate } from '@/features/templates/hooks/useTemplate'
import type { Id } from '@/types/api'

type TemplateDetailProps = {
  templateId: Id
}

export function TemplateDetail({ templateId }: TemplateDetailProps) {
  const templateQuery = useTemplate(templateId)
  const template = templateQuery.data

  return (
    <PlaceholderPanel title={template?.name ?? 'Template detail'}>
      <p>
        Template route is connected for ID `{templateId}`. Forking, files, and
        social actions should compose the template, files, projects, and social
        feature APIs from here.
      </p>
    </PlaceholderPanel>
  )
}
