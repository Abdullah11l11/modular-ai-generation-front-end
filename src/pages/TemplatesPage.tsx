import { PageHeader } from '@/components/ui/PageHeader'
import { TemplateGallery } from '@/features/templates/components/TemplateGallery'

export function TemplatesPage() {
  return (
    <>
      <PageHeader
        title="Templates"
        description="Discover public templates by output type, tags, and popularity."
      />
      <TemplateGallery />
    </>
  )
}
