import { PlaceholderPanel } from '@/components/ui/PlaceholderPanel'
import { useAdminResources } from '@/features/admin/hooks/useAdminResources'
import { useAdminTemplates } from '@/features/admin/hooks/useAdminTemplates'
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers'

export function AdminOverview() {
  const usersQuery = useAdminUsers()
  const templatesQuery = useAdminTemplates()
  const resourcesQuery = useAdminResources()

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <PlaceholderPanel title="Users">
        <p>{usersQuery.data?.meta.total ?? 0} users from admin API.</p>
      </PlaceholderPanel>
      <PlaceholderPanel title="Templates">
        <p>{templatesQuery.data?.meta.total ?? 0} templates pending review.</p>
      </PlaceholderPanel>
      <PlaceholderPanel title="Resources">
        <p>{resourcesQuery.data?.meta.total ?? 0} community resources.</p>
      </PlaceholderPanel>
    </div>
  )
}
