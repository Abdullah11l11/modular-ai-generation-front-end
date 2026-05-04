import { PageHeader } from '@/components/ui/PageHeader'
import { SettingsPanel } from '@/features/me/components/SettingsPanel'

export function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Profile and AI provider configuration."
      />
      <SettingsPanel />
    </>
  )
}
