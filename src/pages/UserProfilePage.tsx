import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { UserProfileView } from '@/features/users/components/UserProfileView'

export function UserProfilePage() {
  const { userId = '' } = useParams()

  return (
    <>
      <PageHeader
        title="Public profile"
        description="Published templates and resources by user."
      />
      <UserProfileView userId={userId} />
    </>
  )
}
