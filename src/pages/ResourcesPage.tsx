import { PageHeader } from '@/components/ui/PageHeader'
import { ResourceGallery } from '@/features/resources/components/ResourceGallery'

export function ResourcesPage() {
  return (
    <>
      <PageHeader
        title="Resources"
        description="Browse reusable prompts, skills, agents, rules, MCPs, and design docs."
      />
      <ResourceGallery />
    </>
  )
}
