import { useNavigate } from 'react-router-dom';
import type { Project } from '@/types/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDuplicateProject } from '@/features/projects/hooks/useDuplicateProject';
import { EllipsisVerticalIcon, PencilIcon, CopyIcon, Trash2Icon, Loader2Icon } from 'lucide-react';

type ProjectCardActionsProps = {
  project: Project;
  onDeleteRequest?: (project: Project) => void;
};

export function ProjectCardActions({ project, onDeleteRequest }: ProjectCardActionsProps) {
  const navigate = useNavigate();
  const duplicateProject = useDuplicateProject();

  return (
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
          onClick={() => duplicateProject.mutate(project)}
          disabled={duplicateProject.isPending}
        >
          {duplicateProject.isPending ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <CopyIcon className="size-3.5" />
          )}
          Duplicate
        </DropdownMenuItem>
        {onDeleteRequest ? (
          <DropdownMenuItem variant="destructive" onClick={() => onDeleteRequest(project)}>
            <Trash2Icon className="size-3.5" />
            Delete
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
