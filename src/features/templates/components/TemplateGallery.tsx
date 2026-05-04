import { Link } from 'react-router-dom'
import { PlaceholderPanel } from '@/components/ui/PlaceholderPanel'
import { useTemplates } from '@/features/templates/hooks/useTemplates'

export function TemplateGallery() {
  const templatesQuery = useTemplates({ sort: 'popular' })
  const templates = templatesQuery.data?.data ?? []

  return (
    <PlaceholderPanel title="Community templates">
      {templates.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Link
              key={template.id}
              to={`/templates/${template.id}`}
              className="rounded-md border border-slate-200 p-4 hover:border-slate-400"
            >
              <p className="font-medium text-slate-950">{template.name}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                {template.description ?? 'Template details pending.'}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p>
          Template discovery is wired to the API module. The gallery will render
          backend results when `/templates` is available.
        </p>
      )}
    </PlaceholderPanel>
  )
}
