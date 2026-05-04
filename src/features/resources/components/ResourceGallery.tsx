import { Link } from 'react-router-dom'
import { PlaceholderPanel } from '@/components/ui/PlaceholderPanel'
import { useResources } from '@/features/resources/hooks/useResources'

export function ResourceGallery() {
  const resourcesQuery = useResources({ sort: 'popular' })
  const resources = resourcesQuery.data?.data ?? []

  return (
    <PlaceholderPanel title="Community resources">
      <div className="mb-4">
        <Link
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          to="/resources/new"
        >
          New resource
        </Link>
      </div>
      {resources.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Link
              key={resource.id}
              to={`/resources/${resource.id}`}
              className="rounded-md border border-slate-200 p-4 hover:border-slate-400"
            >
              <p className="font-medium text-slate-950">{resource.name}</p>
              <p className="mt-1 text-sm text-slate-600">{resource.kind}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p>
          Resource discovery is wired to `/resources` for prompts, skills,
          agents, rules, MCPs, design docs, and hooks.
        </p>
      )}
    </PlaceholderPanel>
  )
}
