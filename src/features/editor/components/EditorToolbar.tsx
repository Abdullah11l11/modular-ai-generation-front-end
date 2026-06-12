import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/features/editor/hooks/useEditorStore';
import { useProject } from '@/features/projects/hooks/useProject';

export function EditorToolbar() {
  const navigate = useNavigate();
  const { state } = useEditorStore();
  const { data: project } = useProject(state.projectId);

  return (
    <div className="flex h-11 shrink-0 items-center gap-2 border-b border-(--bor2) bg-(--sur) px-3">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </Button>

      <span className="max-w-48 truncate text-sm font-semibold text-(--t1)">
        {project?.name ?? 'Loading...'}
      </span>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="sm">Preview</Button>
        <Button variant="ghost" size="sm">Export</Button>
        <Button variant="accent" size="sm">Save</Button>
      </div>
    </div>
  );
}
