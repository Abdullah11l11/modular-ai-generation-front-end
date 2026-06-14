import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/features/editor/hooks/useEditorStore';
import { useProject } from '@/features/projects/hooks/useProject';

type EditorToolbarProps = {
  onOpenSettings: () => void;
};

export function EditorToolbar({ onOpenSettings }: EditorToolbarProps) {
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
        <ArrowLeftIcon className="size-3.5" />
      </Button>

      <span className="max-w-48 truncate text-sm font-semibold text-(--t1)">
        {project?.name ?? 'Loading...'}
      </span>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="sm">Preview</Button>
        <Button variant="ghost" size="sm">Export</Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onOpenSettings}
          aria-label="Project settings"
        >
          <SettingsIcon className="size-4" />
        </Button>
        <Button variant="accent" size="sm">Save</Button>
      </div>
    </div>
  );
}
