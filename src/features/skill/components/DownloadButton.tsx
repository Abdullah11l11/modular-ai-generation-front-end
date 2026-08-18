import { Download, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSkillBundle } from '@/features/skill/hooks/useSkillBundle';

/**
 * Big primary CTA: assemble + download the MGF skill bundle.
 *
 * Disables itself while the zip is being built so a double-click
 * doesn't queue two downloads. Shows an inline spinner instead of the
 * download icon during the brief build phase.
 */
export function DownloadButton() {
  const { download, isBuilding } = useSkillBundle();

  return (
    <Button
      type="button"
      variant="accent"
      size="lg"
      onClick={download}
      disabled={isBuilding}
      className="min-w-[260px]"
    >
      {isBuilding ? (
        <>
          <Loader2Icon className="size-4 animate-spin" />
          Building bundle…
        </>
      ) : (
        <>
          <Download className="size-4" />
          Download MGF Skill Bundle (.zip)
        </>
      )}
    </Button>
  );
}