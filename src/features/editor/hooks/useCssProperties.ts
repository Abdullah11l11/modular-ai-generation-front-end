import { useMemo } from 'react';
import type { CssPropertyGroup, CssPropertyDef } from '@/features/editor/types/cssProperties';

export type CssPropertyWithValue = CssPropertyDef & { currentValue: string };
export type CssGroupWithValues = CssPropertyGroup & { properties: CssPropertyWithValue[] };

export function parseCssValues(content: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const regex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}

export function mergeWithDefaults(
  groups: CssPropertyGroup[],
  parsed: Record<string, string>,
): CssGroupWithValues[] {
  return groups.map((group) => ({
    ...group,
    properties: group.properties.map((prop) => ({
      ...prop,
      currentValue: parsed[prop.varName] ?? prop.defaultValue,
    })),
  }));
}

export function useCssProperties(content: string, groups: CssPropertyGroup[]) {
  const parsed = useMemo(() => parseCssValues(content), [content]);

  const mergedGroups: CssGroupWithValues[] = useMemo(
    () => mergeWithDefaults(groups, parsed),
    [groups, parsed],
  );

  const hasVariables = Object.keys(parsed).length > 0;

  return { groups: mergedGroups, hasVariables };
}
