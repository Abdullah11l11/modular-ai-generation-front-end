import { PageHeader } from '@/components/ui/PageHeader'
import { PlaceholderPanel } from '@/components/ui/PlaceholderPanel'

export function HomePage() {
  return (
    <>
      <PageHeader
        eyebrow="Modular Generation Framework"
        title="Template-first AI visual generation"
        description="Browse community templates, fork them into projects, edit modular layers, and export polished outputs."
      />
      <PlaceholderPanel title="MVP surface">
        <p>
          The app shell is scaffolded around templates, projects, resources,
          editor orchestration, generation, and exports.
        </p>
      </PlaceholderPanel>
    </>
  )
}
