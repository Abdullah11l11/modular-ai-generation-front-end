import { useMemo } from 'react';
import type { CssPropertyDef, CssPropertyGroup } from '@/features/editor/types/cssProperties';

export function parseCssValues(content: string): Map<string, string> {
  const values = new Map<string, string>();
  const regex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    values.set(match[1], match[2].trim());
  }
  return values;
}

export function toGroups(
  registry: CssPropertyDef[],
  currentValues: Map<string, string>,
): CssPropertyGroup[] {
  const groupMap = new Map<string, CssPropertyGroup>();

  for (const def of registry) {
    const value = currentValues.get(def.varName) ?? def.defaultValue;
    if (!groupMap.has(def.group)) {
      groupMap.set(def.group, {
        id: def.group.toLowerCase().replace(/\s+/g, '-'),
        label: def.group,
        properties: [],
      });
    }
    groupMap.get(def.group)!.properties.push({ ...def, currentValue: value });
  }

  return Array.from(groupMap.values());
}

export function useCssProperties(
  content: string,
  registry: CssPropertyDef[],
): { groups: CssPropertyGroup[]; hasVariables: boolean } {
  return useMemo(() => {
    const values = parseCssValues(content);
    const groups = toGroups(registry, values);
    return { groups, hasVariables: values.size > 0 };
  }, [content, registry]);
}
