import { useState } from 'react';
import { useDeleteProject } from '@/features/projects/hooks/useDeleteProject';
import type { Project } from '@/types/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2Icon, Trash2Icon } from 'lucide-react';

type DeleteProjectDialogProps = {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteProjectDialog({ project, open, onOpenChange }: DeleteProjectDialogProps) {
  const deleteProject = useDeleteProject();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject.mutateAsync(project.id);
      onOpenChange(false);
    } catch {
      // Toast handled in the hook
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong className="text-(--t1)">{project.name}</strong>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <Trash2Icon className="size-3.5" />
            )}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
