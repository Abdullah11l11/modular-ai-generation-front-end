import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { EditorWorkspace } from '@/features/editor/components/EditorWorkspace'

export function EditorPage() {
  const { projectId = '' } = useParams()

  return (
    <>
      <PageHeader
        title="Editor"
        description="Project orchestration lives in the editor feature."
      />
      <EditorWorkspace projectId={projectId} />
    </>
  )
}
