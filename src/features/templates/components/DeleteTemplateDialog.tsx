import { useState } from 'react';
import { useDeleteTemplate } from '@/features/templates/hooks/useDeleteTemplate';
import type { Template } from '@/types/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2Icon, Trash2Icon } from 'lucide-react';

type DeleteTemplateDialogProps = {
  template: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * If provided, called after the delete succeeds. The template detail
   * page uses this to navigate back to /templates; the templates list
   * page leaves it undefined since it doesn't need to navigate.
   */
  onDeleted?: () => void;
};

export function DeleteTemplateDialog({
  template,
  open,
  onOpenChange,
  onDeleted,
}: DeleteTemplateDialogProps) {
  const deleteTemplate = useDeleteTemplate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTemplate.mutateAsync(template.id);
      onOpenChange(false);
      onDeleted?.();
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
          <DialogTitle>Delete template</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <strong className="text-(--t1)">{template.name}</strong>? Projects already forked
            from this template will keep their files but lose the link to this template.
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
