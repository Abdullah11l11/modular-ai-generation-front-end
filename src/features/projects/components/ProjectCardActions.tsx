import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '@/types/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteProjectDialog } from '@/features/projects/components/DeleteProjectDialog';
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';

type ProjectCardActionsProps = {
  project: Project;
};

export function ProjectCardActions({ project }: ProjectCardActionsProps) {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="shrink-0 opacity-0 group-hover/card:opacity-100 focus:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisVerticalIcon className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => navigate(`/editor/projects/${project.id}`)}>
            <PencilIcon className="size-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2Icon className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteProjectDialog
        project={project}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
