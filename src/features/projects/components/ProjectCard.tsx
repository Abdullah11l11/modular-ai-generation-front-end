import { useNavigate } from 'react-router-dom';
import type { Project } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { ProjectCardActions } from '@/features/projects/components/ProjectCardActions';

const statusConfig: Record<
  Project['status'],
  { label: string; variant: 'ghost' | 'default' | 'secondary'; className?: string }
> = {
  draft: { label: 'Draft', variant: 'ghost' },
  published: {
    label: 'Published',
    variant: 'default',
    className: 'bg-(--cy) text-[#071112] border-(--cy)',
  },
  archived: { label: 'Archived', variant: 'secondary' },
};

type ProjectCardProps = {
  project: Project;
  onDeleteRequest: (project: Project) => void;
};

export function ProjectCard({ project, onDeleteRequest }: ProjectCardProps) {
  const navigate = useNavigate();
  const status = statusConfig[project.status];
  const initial = project.name.charAt(0).toUpperCase();
  const typeName = project.type?.name ?? 'Untyped';

  const handleClick = () => {
    navigate(`/editor/projects/${project.id}`);
  };

  const formattedDate = new Date(project.updated_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleClick();
        if (e.key === 'Delete') {
          e.preventDefault();
          onDeleteRequest(project);
        }
      }}
      className="group/card flex cursor-pointer flex-col overflow-hidden rounded-(--r12,12px) bg-(--sur) shadow-sm ring-1 ring-(--bor2)/50 transition-all duration-150 hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--cy)"
    >
      <div className="flex aspect-16/10 items-center justify-center bg-(--sur2) text-(--cy)">
        <span className="text-3xl font-extrabold tracking-tight opacity-30">{initial}</span>
      </div>

      <div className="flex flex-col gap-2 p-(--space-card-pad,15px)">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-[13px] font-bold text-(--t1)">{project.name}</h3>
            <p className="text-[11px] font-medium text-(--t3)">{typeName}</p>
          </div>
          <ProjectCardActions project={project} onDeleteRequest={onDeleteRequest} />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Badge variant={status.variant} className={`text-[11px] ${status.className ?? ''}`}>
            {status.label}
          </Badge>
          <span className="text-[11px] font-medium text-(--t3)">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
