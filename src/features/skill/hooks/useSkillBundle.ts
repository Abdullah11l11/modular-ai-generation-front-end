import { useCallback, useState } from 'react';
import { downloadSkillBundle } from '@/features/skill/lib/bundle';
import { toastSuccess, toastError } from '@/lib/toast';

/**
 * Browser-side controller for the skill bundle download.
 *
 * - `download()` triggers the JSZip assembly + browser save.
 * - `isBuilding` is true while the zip is being assembled (~100–300 ms).
 * - Success / failure surfaces as a toast (same pattern as
 *   `useDeleteTemplate` and `useCreateTemplate`).
 */
export function useSkillBundle() {
  const [isBuilding, setIsBuilding] = useState(false);

  const download = useCallback(async () => {
    if (isBuilding) return;
    setIsBuilding(true);
    try {
      await downloadSkillBundle();
      toastSuccess('Skill bundle downloaded — hand it to any AI to generate MGF projects.');
    } catch {
      toastError('Failed to build the bundle. Please try again.');
    } finally {
      setIsBuilding(false);
    }
  }, [isBuilding]);

  return { download, isBuilding };
}