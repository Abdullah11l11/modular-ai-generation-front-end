import { SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types/api';

type EditorToolbarProps = {
  project: Project;
  onOpenSettings: () => void;
};

export function EditorToolbar({ project, onOpenSettings }: EditorToolbarProps) {
  return (
    <div className="flex h-10 items-center justify-between border-b border-(--bor2) bg-(--bg) px-4">
      <span className="text-sm font-medium text-(--t1)">{project.name}</span>
      <Button variant="ghost" size="icon-sm" onClick={onOpenSettings} aria-label="Project settings">
        <SettingsIcon className="size-4" />
      </Button>
    </div>
  );
}
