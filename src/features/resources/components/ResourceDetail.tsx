import { PlaceholderPanel } from '@/components/ui/PlaceholderPanel'
import { useResource } from '@/features/resources/hooks/useResource'
import type { Id } from '@/types/api'

type ResourceDetailProps = {
  resourceId: Id
}

export function ResourceDetail({ resourceId }: ResourceDetailProps) {
  const resourceQuery = useResource(resourceId)

  return (
    <PlaceholderPanel title={resourceQuery.data?.name ?? 'Resource detail'}>
      <p>
        Resource route is connected for ID `{resourceId}`. Forking, comments,
        bookmarks, and upvotes should compose resources and social feature hooks.
      </p>
    </PlaceholderPanel>
  )
}
