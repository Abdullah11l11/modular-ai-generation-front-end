import { useUserResources } from '@/features/users/hooks/useUserResources'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Id , Resource } from '@/types/api'
const mockResources: Resource[] = [
  { id: '1', user_id: '1', name: 'React Prompt Template', kind: 'prompt', description: null, body: '', visibility: 'public', tags: ['react'], fork_count: 3, upvote_count: 8, is_upvoted: false, is_bookmarked: false, created_at: '2026-01-15T10:30:00Z', updated_at: '2026-01-15T10:30:00Z' },
]
// type UserResourcesGridProps = { items: Resource[] }
type UserResourcesGridProps = { userId: Id }

export function UserResourcesGrid({ userId }: UserResourcesGridProps) {
  const { data, isLoading, error } = useUserResources(userId)
  if (isLoading) return <div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
  if (error) return <p className="text-red-500">Failed to load resources</p>
  return (
    <div className="grid grid-cols-3 gap-4">
      {data?.data.map((resource) => (
        <Card key={resource.id}>
          <CardHeader><CardTitle className="text-sm">{resource.name}</CardTitle></CardHeader>
          <CardContent><Badge>{resource.kind}</Badge></CardContent>
        </Card>
      ))}
    </div>
  )
//  من أجل ال MOCK_DATA
//     return (
//     <div className='grid grid-cols-3 gap-4'>
//       {items.map((resource) => (
//         <Card key={resource.id}>
//           <CardHeader><CardTitle className='text-sm'>{resource.name}</CardTitle></CardHeader>
//           <CardContent><Badge>{resource.kind}</Badge></CardContent>
//         </Card>
//       ))}
//     </div>
//   )
}