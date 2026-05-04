import { Link } from 'react-router-dom'
import { PlaceholderPanel } from '@/components/ui/PlaceholderPanel'
import { useProjects } from '@/features/projects/hooks/useProjects'

export function DashboardSummary() {
  const projectsQuery = useProjects()
  const projects = projectsQuery.data?.data ?? []

  return (
    <PlaceholderPanel title="Projects">
      {projects.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/editor/projects/${project.id}`}
              className="rounded-md border border-slate-200 p-4 hover:border-slate-400"
            >
              <p className="font-medium text-slate-950">{project.name}</p>
              <p className="mt-1 text-sm text-slate-600">{project.status}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p>
          Project dashboard is ready to display `/projects` once the backend is
          reachable.
        </p>
      )}
    </PlaceholderPanel>
  )
}
