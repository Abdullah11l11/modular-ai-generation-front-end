import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && (
        <div className="flex size-12 items-center justify-center rounded-xl bg-(--cy-d) text-(--cy)">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-(--t1)">{title}</h3>
      {description && <p className="max-w-xs text-xs text-(--t2)">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
