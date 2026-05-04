import { PlaceholderPanel } from '@/components/ui/PlaceholderPanel'
import { useAiProviders } from '@/features/me/hooks/useAiProviders'
import { useMe } from '@/features/me/hooks/useMe'

export function SettingsPanel() {
  const meQuery = useMe()
  const providersQuery = useAiProviders()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <PlaceholderPanel title="Profile">
        <p>{meQuery.data?.email ?? 'Profile settings will use `/me`.'}</p>
      </PlaceholderPanel>
      <PlaceholderPanel title="AI providers">
        <p>
          {providersQuery.data?.length ?? 0} providers configured through
          `/me/ai-providers`.
        </p>
      </PlaceholderPanel>
    </div>
  )
}
