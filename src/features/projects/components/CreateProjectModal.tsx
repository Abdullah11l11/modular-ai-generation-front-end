import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreateProjectForm } from '@/features/projects/components/CreateProjectForm';
import { FilePlusIcon, LayoutTemplateIcon } from 'lucide-react';

type CreateProjectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleReset = () => {
    setShowForm(false);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleReset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>Choose how to start your project.</DialogDescription>
        </DialogHeader>

        {showForm ? (
          <CreateProjectForm onSuccess={() => onOpenChange(false)} />
        ) : (
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="flex h-auto flex-col items-start gap-1.5 px-4 py-3"
              onClick={() => setShowForm(true)}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <FilePlusIcon className="size-4 text-(--cy)" />
                Start from scratch
              </span>
              <span className="text-xs font-normal text-(--t2)">
                Create a blank project and build from the ground up.
              </span>
            </Button>
            <Button
              variant="outline"
              className="flex h-auto flex-col items-start gap-1.5 px-4 py-3"
              onClick={() => {
                onOpenChange(false);
                navigate('/templates');
              }}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <LayoutTemplateIcon className="size-4 text-(--cy)" />
                From a template
              </span>
              <span className="text-xs font-normal text-(--t2)">
                Browse the marketplace and fork an existing template.
              </span>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
