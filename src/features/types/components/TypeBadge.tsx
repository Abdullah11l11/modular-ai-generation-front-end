import { Badge } from '@/components/ui/badge';
import { resolveOutputType } from '@/features/types/types/outputTypeMap';

type TypeBadgeProps = {
  /** Catalogue type object (e.g. `project.type` / `template.type`). */
  type?: { name: string } | null;
  /** Show archetype label in addition to the type name. */
  showArchetype?: boolean;
};

export function TypeBadge({ type, showArchetype = false }: TypeBadgeProps) {
  const info = resolveOutputType(type ?? undefined);

  return (
    <div className="inline-flex items-center gap-1">
      <Badge variant="outline" className="text-[11px] capitalize text-(--t2)">
        {type?.name ?? info.name}
      </Badge>
      {showArchetype && (
        <Badge variant="ghost" className="text-[11px] capitalize text-(--t3)">
          {info.archetype}
        </Badge>
      )}
    </div>
  );
}
