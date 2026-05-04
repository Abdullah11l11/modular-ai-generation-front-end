import { PlaceholderPanel } from '@/components/ui/PlaceholderPanel'
import { useProjectFiles } from '@/features/files/hooks/useProjectFiles'
import { useProject } from '@/features/projects/hooks/useProject'
import type { Id } from '@/types/api'

type EditorWorkspaceProps = {
  projectId: Id
}

export function EditorWorkspace({ projectId }: EditorWorkspaceProps) {
  const projectQuery = useProject(projectId)
  const filesQuery = useProjectFiles(projectId)
  const files = filesQuery.data?.data ?? []

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr_320px]">
      <PlaceholderPanel title="Layers">
        {files.length > 0 ? (
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file.id} className="rounded-md bg-slate-100 px-3 py-2">
                {file.path}
              </li>
            ))}
          </ul>
        ) : (
          <p>Project files will render from the files feature API.</p>
        )}
      </PlaceholderPanel>
      <PlaceholderPanel title={projectQuery.data?.name ?? 'Live preview'}>
        <div className="min-h-80 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6">
          Preview orchestration belongs to `features/editor`.
        </div>
      </PlaceholderPanel>
      <PlaceholderPanel title="Controls">
        <p>
          CSS controls, generation actions, and export actions should compose
          their own feature hooks instead of owning API calls here.
        </p>
      </PlaceholderPanel>
    </div>
  )
}
