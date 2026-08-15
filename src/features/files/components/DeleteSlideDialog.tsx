import {
  AlertTriangle,
} from 'lucide-react';

import {
  Button,
} from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { ProjectFile } from '@/features/files/types/projectFile';

interface DeleteSlideDialogProps {
  slide: ProjectFile | null;
  open: boolean;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteSlideDialog({
  slide,
  open,
  loading,
  onOpenChange,
  onConfirm,
}: DeleteSlideDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Delete slide?
          </DialogTitle>

          <DialogDescription>
            This will permanently delete{' '}
            <strong>{slide?.name}</strong> from this
            project.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete slide'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}