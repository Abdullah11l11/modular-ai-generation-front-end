import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, EyeIcon, DownloadIcon, SaveIcon } from 'lucide-react';

type EditorToolbarProps = {
  projectName: string;
  onSave?: () => void;
  onExport?: () => void;
  onPreview?: () => void;
};

export function EditorToolbar({ projectName, onSave, onExport, onPreview }: EditorToolbarProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-12 items-center gap-3 border-b border-(--bor2) px-(--space-page-x)">
      <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
        <ArrowLeftIcon className="size-4" />
      </Button>

      <span className="text-sm font-medium text-(--t1)">{projectName}</span>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onPreview}>
          <EyeIcon className="size-3.5" />
          Preview
        </Button>

        <Button variant="ghost" size="sm" onClick={onExport}>
          <DownloadIcon className="size-3.5" />
          Export
        </Button>

        <Button variant="accent" size="sm" onClick={onSave}>
          <SaveIcon className="size-3.5" />
          Save
        </Button>
      </div>
    </div>
  );
}
