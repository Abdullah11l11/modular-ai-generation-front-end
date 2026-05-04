import { PlaceholderPanel } from '@/components/ui/PlaceholderPanel'
import { useUser } from '@/features/users/hooks/useUser'
import { useUserResources } from '@/features/users/hooks/useUserResources'
import { useUserTemplates } from '@/features/users/hooks/useUserTemplates'
import type { Id } from '@/types/api'

type UserProfileViewProps = {
  userId: Id
}

export function UserProfileView({ userId }: UserProfileViewProps) {
  const userQuery = useUser(userId)
  useUserTemplates(userId)
  useUserResources(userId)

  return (
    <PlaceholderPanel title={userQuery.data?.name ?? 'User profile'}>
      <p>
        Public user profile route is connected for ID `{userId}` with template
        and resource lists scoped to the users feature.
      </p>
    </PlaceholderPanel>
  )
}
