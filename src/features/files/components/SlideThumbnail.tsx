import { cn } from '@/lib/utils';
import type { ProjectFile } from '@/features/files/types/projectFile';

interface SlideThumbnailProps {
  file: ProjectFile;
  active?: boolean;
}

export function SlideThumbnail({
  file,
  active = false,
}: SlideThumbnailProps) {
  return (
    <div
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-md',
        'border bg-muted',
        active
          ? 'border-[var(--cy)] ring-1 ring-[var(--cy)]'
          : 'border-border',
      )}
    >
      {file.content ? (
        <iframe
          title={file.name}
          srcDoc={file.content}
          sandbox=""
          className="pointer-events-none absolute left-0 top-0 h-[1000%] w-[1000%] origin-top-left scale-[0.1]"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <span className="text-[10px]">No preview</span>
        </div>
      )}
    </div>
  );
}